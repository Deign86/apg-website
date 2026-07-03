import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/admin/Toast";

const SETTINGS_KEYS = [
  { key: "company_phone", label: "Company Phone" },
  { key: "company_email", label: "Company Email" },
  { key: "company_address", label: "Company Address" },
  { key: "social_facebook", label: "Facebook URL" },
  { key: "social_instagram", label: "Instagram URL" },
  { key: "social_linkedin", label: "LinkedIn URL" },
];

export default function Settings() {
  const toast = useToast();
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({data}) => {
      const v = {};
      (data||[]).forEach(s => { v[s.key] = s.value; });
      setValues(v);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    for (const item of SETTINGS_KEYS) {
      await supabase.from("site_settings").upsert({ key: item.key, value: values[item.key] || "" }, { onConflict: "key" });
    }
    toast("Settings saved", "success");
    setSaving(false);
  };

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;

  return (
    <>
      <Helmet><title>Settings | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header"><h1>Settings</h1></div>
      <div className="admin-card" style={{maxWidth:600}}>
        <div className="admin-form">
          {SETTINGS_KEYS.map(item => (
            <div key={item.key} className="admin-field">
              <label>{item.label}</label>
              <input value={values[item.key] || ""} onChange={e => setValues(p=>({...p, [item.key]: e.target.value}))} />
            </div>
          ))}
          <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving} style={{width:"fit-content"}}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </>
  );
}
