import 'dotenv/config';  // loads .env + .env.local for the Node server
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import http from "http";
import { handleAiChat, handleAiInsights, handleAiLead } from "./ai.js";

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
  if (profile.role !== "admin") return sendJSON(res, 403, { message: "Forbidden" });

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

  // POST /api/admin/seed-content — seed fallback rows when tables empty
  if (req.method === "POST" && path === "/api/admin/seed-content") {
    const seedData = [
      { table: "blog_posts", rows: [
        { slug: "future-of-commercial-real-estate-2024", title: "The Future of Commercial Real Estate in 2024", excerpt: "Discover emerging trends shaping the commercial property market.", category: "Real Estate", status: "published", published_at: new Date().toISOString(), content: "Full article content." },
        { slug: "logistics-warehouses-best-investment", title: "Why Logistics Warehouses are the Best Investment", excerpt: "Industrial spaces are becoming the most sought-after assets.", category: "Investment", status: "published", published_at: new Date().toISOString(), content: "Full article content." },
        { slug: "maximizing-productivity-virtual-office", title: "Maximizing Productivity in Your Virtual Office", excerpt: "Leverage virtual office services to boost your business image.", category: "Lifestyle", status: "published", published_at: new Date().toISOString(), content: "Full article content." },
      ]},
      { table: "job_openings", rows: [
        { title: "Real Estate Consultant", location: "Makati City", type: "Full-time", tag: "Commission Based", status: "active" },
        { title: "Property Manager", location: "BGC, Taguig", type: "Full-time", tag: "2+ Years Exp", status: "active" },
        { title: "Marketing Associate", location: "Quezon City", type: "Part-time", tag: "Digital Marketing", status: "active" },
      ]},
      { table: "chatbot_kb", rows: [
        { trigger: "hello,hi,greetings", answer: "Greetings! How may I assist you with Alpha Premier?", priority: 1, active: true },
        { trigger: "properties,listings,real estate", answer: "We offer premium properties across the Philippines.", priority: 1, active: true },
        { trigger: "contact,email,phone", answer: "Contact us at alphapremierrealty@gmail.com or call +63 (2) 1234 5678.", priority: 1, active: true },
        { trigger: "virtual office,address,workspace", answer: "Alpha Premier Virtual Office at Ortigas provides premium addresses.", priority: 1, active: true },
        { trigger: "careers,jobs,apply", answer: "Check our Careers page for current openings!", priority: 1, active: true },
      ]},
      { table: "site_settings", rows: [
        { key: "company_phone", value: "+63 (2) 1234 5678" }, { key: "company_email", value: "alphapremierrealty@gmail.com" }, { key: "company_address", value: "Ortigas Center, Pasig City, Philippines" },
        { key: "social_facebook", value: "#" }, { key: "social_instagram", value: "#" }, { key: "social_linkedin", value: "#" },
      ]},
    ];
    const results = [];
    for (const { table, rows } of seedData) {
      const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
      if (count === 0) {
        const { error } = await supabase.from(table).insert(rows);
        results.push({ table, seeded: !error, count: rows.length, error: error?.message || null });
      } else results.push({ table, skipped: true, count });
    }
    return sendJSON(res, 200, { success: true, results });
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
  // AI endpoints
  if (url.startsWith("/api/ai") && req.method === "POST") {
    const body = await parseBody(req);
    if (url === "/api/ai/chat") {
      const { status, data } = await handleAiChat(supabase, body);
      return sendJSON(res, status, data);
    }
    // Admin-guarded AI routes
    if (url === "/api/ai/insights" || url === "/api/ai/lead") {
      const profile = await verifyAdmin(req);
      if (!profile) return sendJSON(res, 401, { message: "Unauthorized" });
      if (profile.role !== "admin") return sendJSON(res, 403, { message: "Forbidden" });
      const { status, data } = url === "/api/ai/insights"
        ? await handleAiInsights(supabase, body)
        : await handleAiLead(supabase, body);
      return sendJSON(res, status, data);
    }
  }
  sendJSON(res, 404, { success: false, message: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!supabase) console.log("  WARN: Supabase not configured - inquiry persistence disabled");
  if (!resend) console.log("  WARN: Resend not configured - email sending disabled");
});
