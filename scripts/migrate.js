// migrate.js - PHP/MySQL -> Firebase migration (Firestore + Auth + Storage)
// Usage: node scripts/migrate.js [--no-images] [--no-auth]
// Requires: firebase login (Application Default Credentials) OR GOOGLE_APPLICATION_CREDENTIALS
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const ROOT = path.resolve(__dirname, "..");
const SQL_PATH = path.join(ROOT, "website", "u501100418_apg_database.sql");

const args = process.argv.slice(2);
const SKIP_IMAGES = args.includes("--no-images");
const SKIP_AUTH = args.includes("--no-auth");

// ---- Initialize Admin SDK (uses ADC from `firebase login`) ----
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: "alphapremier-group.appspot.com"
});
const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

// ============================================================
// SQL DUMP PARSER
// ============================================================
function parseSqlDump(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const tables = {};
  const insertRe = /INSERT INTO `([a-z_]+)` \(([^)]+)\) VALUES ([\s\S]*?);/g;
  let m;
  while ((m = insertRe.exec(raw)) !== null) {
    const tableName = m[1];
    const columns = m[2].split(",").map(c => c.replace(/`/g, "").trim());
    const rows = parseValuesTuples(m[3]);
    if (!tables[tableName]) tables[tableName] = { columns: [], rows: [] };
    tables[tableName].columns = columns;
    tables[tableName].rows.push(...rows);
  }
  return tables;
}

// Parse a VALUES (...),(...),(...); block into array of arrays.
function parseValuesTuples(text) {
  const tuples = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    while (i < n && /[\s,\r\n]/.test(text[i])) i++;
    if (i >= n || text[i] !== "(") break;
    i++;
    const vals = [];
    let cur = "";
    let inStr = false;
    while (i < n) {
      const ch = text[i];
      if (inStr) {
        if (ch === "\\") { cur += text[i] + (text[i + 1] || ""); i += 2; continue; }
        if (ch === "'") { inStr = false; i++; continue; }
        cur += ch; i++;
      } else {
        if (ch === "'") { inStr = true; i++; continue; }
        if (ch === ",") { vals.push(finalize(cur)); cur = ""; i++; continue; }
        if (ch === ")") { vals.push(finalize(cur)); i++; break; }
        cur += ch; i++;
      }
    }
    tuples.push(vals);
    i++;
  }
  return tuples;
}

// Turn a raw token into a JS value (string, number, null, bool)
function finalize(tok) {
  const t = tok.trim();
  if (t === "" || t === "NULL") return null;
  if (t === "true") return true;
  if (t === "false") return false;
  // quoted string: strip surrounding single quotes
  if (t.charAt(0) === "'" && t.charAt(t.length - 1) === "'") {
    return t.slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\0/g, "\0");
  }
  // number
  if (/^-?\d+\.\d+$/.test(t) || /^-?\d+$/.test(t)) return Number(t);
  return t;
}

// Convert "YYYY-MM-DD HH:MM:SS" -> Firestore Timestamp
function toTs(v) {
  if (v === null || v === undefined || v === "") return null;
  const d = new Date(String(v).replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return null;
  return admin.firestore.Timestamp.fromDate(d);
}

// ============================================================
// BATCHED WRITE HELPER
// ============================================================
async function writeCollection(collName, docs, maxBatch) {
  maxBatch = maxBatch || 400;
  let batch = db.batch();
  let count = 0;
  for (const doc of docs) {
    const ref = db.collection(collName).doc(String(doc.id));
    const data = Object.assign({}, doc);
    delete data.id;
    batch.set(ref, data);
    count++;
    if (count % maxBatch === 0) {
      await batch.commit();
      batch = db.batch();
      console.log("  " + collName + ": " + count + "/" + docs.length);
    }
  }
  if (count % maxBatch !== 0) await batch.commit();
  console.log("Wrote " + count + " docs to " + collName);
}

// ============================================================
// IMAGE UPLOAD HELPER
// ============================================================
const uploaded = new Set();
async function uploadImageIfNeeded(relPath) {
  if (!relPath || relPath === "") return null;
  const clean = relPath.replace(/^\.?\/+/, "");
  if (uploaded.has(clean)) return clean;
  const local = path.join(ROOT, clean);
  if (!fs.existsSync(local)) {
    console.warn("  [skip] missing local image: " + clean);
    return null;
  }
  const dest = clean.replace(/^uploads\//, "");
  try {
    await bucket.upload(local, { destination: dest, metadata: { contentType: guessMime(clean) } });
    uploaded.add(clean);
    return "https://storage.googleapis.com/alphapremier-group.appspot.com/" + dest;
  } catch (e) {
    console.warn("  [err] upload failed " + clean + ": " + e.message);
    return null;
  }
}
function guessMime(p) {
  if (p.endsWith(".png")) return "image/png";
  if (/\.jpe?g$/i.test(p)) return "image/jpeg";
  if (p.endsWith(".gif")) return "image/gif";
  if (p.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("Parsing SQL dump...");
  const tables = parseSqlDump(SQL_PATH);
  const summary = {};
  for (const k of Object.keys(tables)) summary[k] = tables[k].rows.length;
  console.log("Parsed tables: " + JSON.stringify(summary));

  // ---------- ADMINS -> Auth + users/{uid} ----------
  const adminUidMap = {};
  if (tables.admins) {
    console.log("\n[admins] Creating Firebase Auth users...");
    for (const row of tables.admins.rows) {
      const cols = tables.admins.columns;
      const rec = {};
      cols.forEach(function (c, i) { rec[c] = row[i]; });
      const email = (rec.email && String(rec.email).trim() !== "")
        ? rec.email
        : rec.username + "@alphapremier.local";
      const password = rec.password || "ApGTemp2025!";
      let user;
      try {
        user = await auth.createUser({
          email: email,
          password: password,
          displayName: rec.display_name || rec.username,
          emailVerified: true
        });
      } catch (e) {
        if (e.code === "auth/email-already-exists") {
          user = await auth.getUserByEmail(email);
          console.log("  user exists: " + email + " -> " + user.uid);
        } else {
          console.warn("  failed " + email + ": " + e.message);
          continue;
        }
      }
      adminUidMap[rec.id] = user.uid;
      const role = String(rec.role || "Moderator").toLowerCase() === "owner" ? "owner" : "Moderator";
      if (!SKIP_AUTH) {
        await auth.setCustomUserClaims(user.uid, { role: role });
      }
      await db.collection("users").doc(user.uid).set({
        uid: user.uid,
        username: rec.username,
        displayName: rec.display_name || null,
        role: role,
        email: email,
        profileImage: rec.profile_image || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log("  admin id=" + rec.id + " -> uid=" + user.uid + " (" + email + ") role=" + role);
    }
  }

  // ---------- OFFERINGS ----------
  if (tables.offerings_cards) {
    console.log("\n[offerings_cards] -> offerings");
    const docs = [];
    for (const row of tables.offerings_cards.rows) {
      const rec = {};
      tables.offerings_cards.columns.forEach(function (c, i) { rec[c] = row[i]; });
      let images = [];
      if (rec.images && String(rec.images).trim() !== "") {
        const parts = String(rec.images).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        if (!SKIP_IMAGES) {
          for (const p of parts) {
            const url = await uploadImageIfNeeded(p);
            images.push(url || p);
          }
        } else {
          images = parts;
        }
      }
      docs.push({
        id: rec.id,
        title: rec.title,
        location: rec.location,
        property_type: rec.property_type,
        status: rec.status,
        created_at: toTs(rec.created_at),
        updated_at: toTs(rec.updated_at),
        admin_id: adminUidMap[rec.admin_id] || rec.admin_id || null,
        description: rec.description,
        price: rec.price,
        price_unit: rec.price_unit,
        floor_area: rec.floor_area,
        lot_area: rec.lot_area,
        email: rec.email,
        phone: rec.phone,
        images: images
      });
    }
    await writeCollection("offerings", docs);
  }

  // ---------- SERVICES ----------
  if (tables.services) {
    console.log("\n[services] -> services");
    const docs = tables.services.rows.map(function (row) {
      const rec = {};
      tables.services.columns.forEach(function (c, i) { rec[c] = row[i]; });
      return {
        id: rec.id, name: rec.name, text_color: rec.text_color,
        created_at: toTs(rec.created_at), website_link: rec.website_link,
        card_image: rec.card_image, card_logo: rec.card_logo
      };
    });
    await writeCollection("services", docs);
  }

  // ---------- CAREERS ----------
  if (tables.careers) {
    console.log("\n[careers] -> careers");
    const docs = tables.careers.rows.map(function (row) {
      const rec = {};
      tables.careers.columns.forEach(function (c, i) { rec[c] = row[i]; });
      return {
        id: rec.id, title: rec.title, type: rec.type, location: rec.location,
        work_setup: rec.work_setup, key_responsibilities: rec.key_responsibilities,
        description: rec.description,
        admin_id: adminUidMap[rec.admin_id] || null,
        created_at: toTs(rec.created_at)
      };
    });
    await writeCollection("careers", docs);
  }

  // ---------- BLOGS ----------
  if (tables.blogs) {
    console.log("\n[blogs] -> blogs");
    const docs = tables.blogs.rows.map(function (row) {
      const rec = {};
      tables.blogs.columns.forEach(function (c, i) { rec[c] = row[i]; });
      return {
        id: rec.id, title: rec.title, author: rec.author, content: rec.content,
        date_published: toTs(rec.date_published), image: rec.image, author_image: rec.author_image
      };
    });
    await writeCollection("blogs", docs);
  }

  // ---------- CHAT SESSIONS + MESSAGES ----------
  if (tables.chat_active_sessions) {
    console.log("\n[chat_active_sessions] -> chatSessions");
    const docs = tables.chat_active_sessions.rows.map(function (row) {
      const rec = {};
      tables.chat_active_sessions.columns.forEach(function (c, i) { rec[c] = row[i]; });
      return {
        id: rec.session_id, session_id: rec.session_id,
        visitor_name: rec.visitor_name, visitor_email: rec.visitor_email,
        visitor_session_token: rec.session_id,
        last_active: toTs(rec.last_active), created_at: toTs(rec.created_at),
        visitor_peer_id: rec.visitor_peer_id || null, admin_peer_id: rec.admin_peer_id || null,
        call_status: rec.call_status || "none"
      };
    });
    await writeCollection("chatSessions", docs);
  }
  if (tables.chat_support_messages) {
    console.log("\n[chat_support_messages] -> chatSessions/{id}/messages");
    let count = 0;
    for (const row of tables.chat_support_messages.rows) {
      const rec = {};
      tables.chat_support_messages.columns.forEach(function (c, i) { rec[c] = row[i]; });
      const sid = rec.session_id;
      if (!sid) continue;
      let image_url = rec.image_url || null;
      if (image_url && !SKIP_IMAGES) {
        const u = await uploadImageIfNeeded(image_url);
        if (u) image_url = u;
      }
      await db.collection("chatSessions").doc(sid).collection("messages")
        .doc(String(rec.id)).set({
          id: rec.id, session_id: sid, visitor_name: rec.visitor_name,
          visitor_email: rec.visitor_email, message: rec.message,
          sender_type: rec.sender_type, is_read: rec.is_read || 0,
          created_at: toTs(rec.created_at), image_url: image_url
        });
      count++;
      if (count % 200 === 0) console.log("  messages: " + count);
    }
    console.log("Wrote " + count + " chat messages");
  }


  // ---------- PROPERTY COMMENTS ----------
  if (tables.property_comments) {
    console.log("\n[property_comments] -> offerings/{id}/comments");
    let count = 0;
    for (const row of tables.property_comments.rows) {
      const rec = {};
      tables.property_comments.columns.forEach(function (c, i) { rec[c] = row[i]; });
      await db.collection("offerings").doc(String(rec.property_id))
        .collection("comments").doc(String(rec.id)).set({
          id: rec.id, property_id: String(rec.property_id),
          user_name: rec.user_name, comment_text: rec.comment_text,
          created_at: toTs(rec.created_at)
        });
      count++;
    }
    console.log("Wrote " + count + " comments");
  }

  // ---------- PROPERTY RATINGS ----------
  if (tables.property_ratings) {
    console.log("\n[property_ratings] -> offerings/{id}/ratings");
    let count = 0;
    for (const row of tables.property_ratings.rows) {
      const rec = {};
      tables.property_ratings.columns.forEach(function (c, i) { rec[c] = row[i]; });
      const rid = String(rec.user_ip || "unknown").replace(/[:.]/g, "-");
      await db.collection("offerings").doc(String(rec.property_id))
        .collection("ratings").doc(rid).set({
          id: rec.id, property_id: String(rec.property_id),
          user_ip: rec.user_ip, rating: rec.rating, created_at: toTs(rec.created_at)
        });
      count++;
    }
    console.log("Wrote " + count + " ratings");
  }

  // ---------- PROPERTY REACTIONS ----------
  if (tables.property_reactions) {
    console.log("\n[property_reactions] -> offerings/{id}/reactions");
    let count = 0;
    for (const row of tables.property_reactions.rows) {
      const rec = {};
      tables.property_reactions.columns.forEach(function (c, i) { rec[c] = row[i]; });
      const rid = String(rec.user_ip || "unknown").replace(/[:.]/g, "-");
      await db.collection("offerings").doc(String(rec.property_id))
        .collection("reactions").doc(rid).set({
          id: rec.id, property_id: String(rec.property_id),
          user_ip: rec.user_ip, reaction_type: rec.reaction_type,
          created_at: toTs(rec.created_at)
        });
      count++;
    }
    console.log("Wrote " + count + " reactions");
  }

  console.log("\n=== Migration complete ===");
  console.log("Images uploaded: " + uploaded.size);
  await admin.app().delete();
}

main().catch(async function (e) {
  console.error("MIGRATION FAILED:", e);
  try { await admin.app().delete(); } catch (_) {}
  process.exit(1);
});

