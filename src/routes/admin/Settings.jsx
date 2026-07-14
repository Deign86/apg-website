import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/admin/Toast";
import { logActivity } from "@/lib/logActivity";

const SETTINGS_GROUPS = [
  {
    title: "Site Settings",
    description: "Basic company information displayed across the site.",
    keys: [
      { key: "site_name", label: "Site Name", type: "text" },
      { key: "company_email", label: "Contact Email", type: "email" },
      { key: "company_phone", label: "Contact Phone", type: "text" },
      { key: "company_address", label: "Company Address", type: "text" },
    ],
  },
  {
    title: "Social Links",
    description: "Social media links shown in the footer.",
    keys: [
      { key: "social_facebook", label: "Facebook URL", type: "text" },
      { key: "social_instagram", label: "Instagram URL", type: "text" },
      { key: "social_tiktok", label: "TikTok URL", type: "text" },
    ],
  },
  {
    title: "AI Settings",
    description: "Control the AI chatbot and insights panel.",
    keys: [
      { key: "ai_enabled", label: "Enable AI Chatbot", type: "boolean" },
      { key: "ai_chatbot_enabled", label: "Enable AI Insights", type: "boolean" },
    ],
  },
  {
    title: "Notifications",
    description: "Email alerts for new leads.",
    keys: [
      { key: "notify_new_lead_email", label: "Email on New Lead", type: "boolean" },
      { key: "notify_email_address", label: "Notification Email Address", type: "email" },
    ],
  },
  {
    title: "Careers Page",
    description: "Heading and subtitle shown on the public careers page.",
    keys: [
      { key: "careers_hero_title", label: "Hero Title", type: "text" },
      { key: "careers_hero_subtitle", label: "Hero Subtitle", type: "text" },
    ],
  },
];

export default function Settings() {
  const toast = useToast();
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const allKeys = SETTINGS_GROUPS.flatMap(g => g.keys.map(k => k.key));
    const { data } = await supabase.from("site_settings").select("*").in("key", allKeys);
    const map = {};
    (data || []).forEach(s => { map[s.key] = s.value; });
    setValues(prev => ({ ...prev, ...map }));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveGroup = async (group) => {
    setSaving(true);
    const updates = group.keys.map(k => ({ key: k.key, value: k.type === "boolean" ? String(values[k.key] === true || values[k.key] === "true") : values[k.key] || "" }));
    const { error } = await supabase.from("site_settings").upsert(updates, { onConflict: "key" });
    if (error) return toast(error.message, "error");
    await logActivity({ action: "update_settings", resourceType: "settings", resourceId: group.title, resourceTitle: group.title, details: `Updated ${group.title} settings` });
    toast(group.title + " saved", "success");
    setSaving(false);
  };

  const setValue = (key, val) => setValues(p => ({ ...p, [key]: val }));

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;

  return (
    <>
      <Helmet><title>Settings | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header"><h1>Settings</h1></div>

      {SETTINGS_GROUPS.map(group => (
        <div key={group.title} className="admin-card" style={{ marginBottom: 20, maxWidth: 700 }}>
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "1rem", color: "#fff" }}>{group.title}</h3>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>{group.description}</p>
          </div>
          <div className="admin-form">
            {group.keys.map(k => (
              <div key={k.key} className="admin-field">
                <label>{k.label}</label>
                {k.type === "boolean" ? (
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.9rem", color: "#ccc" }}>
                    <input type="checkbox" checked={values[k.key] === true || values[k.key] === "true"} onChange={e => setValue(k.key, e.target.checked)} />
                    {values[k.key] === true || values[k.key] === "true" ? "Enabled" : "Disabled"}
                  </label>
                ) : (
                  <input type={k.type} value={values[k.key] || ""} onChange={e => setValue(k.key, e.target.value)} />
                )}
              </div>
            ))}
          </div>
          <button className="admin-btn admin-btn-primary" onClick={() => saveGroup(group)} disabled={saving} style={{ marginTop: 14 }}>
            {saving ? "Saving..." : "Save " + group.title}
          </button>
        </div>
      ))}

      <div className="admin-card" style={{ maxWidth: 700 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "1rem", color: "#fff" }}>Storage</h3>
        <p style={{ fontSize: "0.85rem", color: "#aaa", margin: "0 0 8px" }}>
          Image uploads are stored in Supabase Storage buckets: <strong>listing-images</strong>, <strong>blog-covers</strong>.
        </p>
        <a href="https://supabase.com/dashboard/project/_/storage/buckets" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
          <i className="fa-solid fa-arrow-up-right-from-square" /> Open Supabase Storage
        </a>
        <p style={{ fontSize: "0.75rem", color: "#666", margin: "8px 0 0" }}>Manage files, set policies, and view bucket details.</p>
      </div>
    </>
  );
}
