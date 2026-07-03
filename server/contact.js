import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import http from "http";

const PORT = process.env.PORT || 3001;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || "alphapremierrealty@gmail.com";

const supabase = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => { try { resolve(JSON.parse(body)); } catch { resolve(null); } });
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
}

function escapeHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
async function handleContact(req, res, data) {
  if (!data || !data.name || !data.email || !data.message) {
    return sendJSON(res, 400, { success: false, message: "Name, email, and message required." });
  }
  const ticket = "APR-" + new Date().toISOString().slice(0,10).replace(/-/g,"") + "-" + Math.random().toString(36).slice(2,6).toUpperCase();
  if (supabase) {
    try {
      await supabase.from("inquiries").insert({
        ticket, name: data.name, email: data.email, phone: data.phone || null,
        subject: data.subject || null, message: data.message, source: data.source || "contact_form",
        property_id: data.property_id || null, status: "new",
      });
    } catch (err) { console.error("Inquiry persist error (non-blocking):", err); }
  }
  if (!resend) {
    return sendJSON(res, 200, { success: true, message: "Inquiry received (email disabled).", ticket });
  }
  try {
    const { error } = await resend.emails.send({
      from: "Alpha Premier Group <onboarding@resend.dev>",
      to: [COMPANY_EMAIL], replyTo: data.email,
      subject: data.subject ? `Contact Form: ${data.subject} [${ticket}]` : `New Inquiry from ${data.name} [${ticket}]`,
      html: "<p>Ticket: " + escapeHtml(ticket) + "</p><p>Name: " + escapeHtml(data.name) + "</p><p>Email: " + escapeHtml(data.email) + "</p><p>Message: " + escapeHtml(data.message).replace(/\n/g,"<br>") + "</p>",
    });
    if (error) { console.error("Resend error:", error); return sendJSON(res, 500, { success: false, message: "Failed to send email." }); }
    sendJSON(res, 200, { success: true, message: "Message sent!", ticket: ticket });
  } catch (err) {
    console.error("Server error:", err);
    sendJSON(res, 500, { success: false, message: "Internal error." });
  }
}
async function verifyAdmin(req) {
  try {
    const auth = req.headers["authorization"];
    if (!auth || !auth.startsWith("Bearer ")) return null;
    const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7));
    if (error || !user) return null;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    return profile;
  } catch { return null; }
}

async function handleAdminRoute(req, res) {
  if (!supabase) return sendJSON(res, 503, { message: "Supabase not configured" });
  const profile = await verifyAdmin(req);
  if (!profile) return sendJSON(res, 401, { message: "Unauthorized" });
  if (!["owner","admin"].includes(profile.role)) return sendJSON(res, 403, { message: "Forbidden" });

  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
  const data = ["POST","PUT"].includes(req.method) ? await parseBody(req) : null;

  if (req.method === "GET" && path === "/api/admin/stats") {
    const [listings, leads] = await Promise.all([
      supabase.from("offerings").select("*", { count:"exact", head:true }).eq("is_published",true).is("deleted_at",null),
      supabase.from("inquiries").select("*"),
    ]);
    return sendJSON(res, 200, {
      listings: listings.count || 0, leads: (leads.data||[]).length,
      newLeads: (leads.data||[]).filter(l => l.status === "new").length,
      won: (leads.data||[]).filter(l => l.status === "won").length,
    });
  }

  const roleMatch = path.match(/^\/api\/admin\/users\/([^\/]+)\/role$/);
  if (req.method === "PUT" && roleMatch) {
    if (roleMatch[1] === profile.id) return sendJSON(res, 400, { message: "Cannot change own role" });
    const { error } = await supabase.from("profiles").update({ role: data.role }).eq("id", roleMatch[1]);
    return sendJSON(res, error ? 500 : 200, error ? { message: error.message } : { success: true });
  }

  const activeMatch = path.match(/^\/api\/admin\/users\/([^\/]+)\/active$/);
  if (req.method === "PUT" && activeMatch) {
    if (activeMatch[1] === profile.id) return sendJSON(res, 400, { message: "Cannot change own status" });
    const { error } = await supabase.from("profiles").update({ active: data.active }).eq("id", activeMatch[1]);
    return sendJSON(res, error ? 500 : 200, error ? { message: error.message } : { success: true });
  }

  if (req.method === "POST" && path === "/api/admin/users/invite") {
    const { error: ie } = await supabase.auth.admin.inviteUserByEmail(data.email);
    if (ie) return sendJSON(res, 500, { message: ie.message });
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const found = users?.find(u => u.email === data.email);
    if (found) {
      await supabase.from("profiles").upsert({ id: found.id, email: data.email, full_name: data.fullName || data.email, role: data.role || "editor", active: true });
    }
    return sendJSON(res, 200, { success: true });
  }

  return sendJSON(res, 404, { message: "Admin route not found" });
}
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return sendJSON(res, 200, {});
  const url = req.url || "";
  if (url === "/api/contact" && req.method === "POST") {
    return handleContact(req, res, await parseBody(req));
  }
  if (url.startsWith("/api/admin")) {
    return handleAdminRoute(req, res);
  }
  sendJSON(res, 404, { success: false, message: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!supabase) console.log("  WARN: Supabase not configured - inquiry persistence disabled");
  if (!resend) console.log("  WARN: Resend not configured - email sending disabled");
});
