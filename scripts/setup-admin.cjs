// scripts/setup-admin.cjs — Bootstrap first admin + seed fallback content
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !key) { console.error('Missing VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in env'); process.exit(1); }

const supabase = createClient(supabaseUrl, key, { auth: { autoRefreshToken: false, persistSession: false } });
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(r => rl.question(q, r));

async function main() {
  console.log('\n🚀 Alpha Premier Group — Admin Setup\n');
  const email = await ask('Admin email: ');
  const password = await ask('Admin password (min 6): ');
  const name = await ask('Full name: ') || email;

  const { data: user, error: ce } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } });
  if (ce) {
    const { data: list } = await supabase.auth.admin.listUsers();
    const found = list?.users?.find(u => u.email === email);
    if (found) {
      await supabase.from('profiles').update({ role: 'admin', full_name: name, active: true }).eq('id', found.id);
      console.log('✅ Existing user promoted to admin');
    } else { console.error('❌', ce.message); rl.close(); return; }
  } else {
    await supabase.from('profiles').upsert({ id: user.user.id, email, full_name: name, role: 'admin', active: true });
    console.log(`✅ Admin created: ${email}`);
  }

  // Seed fallback content
  for (const { table, label, rows } of [
    { table:"blog_posts", label:"blog posts", rows:[
      {slug:"future-of-commercial-real-estate-2024",title:"The Future of Commercial Real Estate in 2024",excerpt:"Discover emerging trends shaping the commercial property market.",category:"Real Estate",status:"published",published_at:new Date().toISOString(),content:"Full article content."},
      {slug:"logistics-warehouses-best-investment",title:"Why Logistics Warehouses are the Best Investment",excerpt:"Industrial spaces are becoming the most sought-after assets.",category:"Investment",status:"published",published_at:new Date().toISOString(),content:"Full article content."},
      {slug:"maximizing-productivity-virtual-office",title:"Maximizing Productivity in Your Virtual Office",excerpt:"Leverage virtual office services to boost your business image.",category:"Lifestyle",status:"published",published_at:new Date().toISOString(),content:"Full article content."},
    ]},
    { table:"job_openings", label:"job openings", rows:[
      {title:"Real Estate Consultant",location:"Makati City",type:"Full-time",tag:"Commission Based",status:"active"},
      {title:"Property Manager",location:"BGC, Taguig",type:"Full-time",tag:"2+ Years Exp",status:"active"},
      {title:"Marketing Associate",location:"Quezon City",type:"Part-time",tag:"Digital Marketing",status:"active"},
    ]},
    { table:"chatbot_kb", label:"KB intents", rows:[
      {trigger:"ceo,president,founder,leadership,mark anthony,abito-santos,abito",answer:"Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations.",priority:5,active:true},
      {trigger:"hello,hi,greetings",answer:"Greetings! How may I assist you with Alpha Premier?",priority:1,active:true},
      {trigger:"properties,listings,real estate",answer:"We offer premium properties across the Philippines.",priority:1,active:true},
      {trigger:"contact,email,phone,address,located,facebook,fb",answer:"You can reach Alpha Premier at 0915 888 9482 / 02 8 650 2540, or email contact@alphapremier.com. Our office is at Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City. Facebook: https://www.facebook.com/alphapremierRealty",priority:5,active:true},
      {trigger:"virtual office,address,workspace",answer:"Alpha Premier Virtual Office at Ortigas provides premium addresses.",priority:1,active:true},
      {trigger:"careers,jobs,apply",answer:"Check our Careers page for current openings!",priority:1,active:true},
    ]},
    { table:"site_settings", label:"site settings", rows:[
      {key:"company_phone",value:"0915 888 9482 / 02 8 650 2540"},{key:"company_email",value:"contact@alphapremier.com"},{key:"company_address",value:"Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City"},
      {key:"social_facebook",value:"https://www.facebook.com/alphapremierRealty"},{key:"social_instagram",value:"#"},{key:"social_linkedin",value:"#"},
    ]},
  ]) {
    const { count } = await supabase.from(table).select("*", { count:"exact", head:true });
    if (count === 0) {
      await supabase.from(table).insert(rows.map(r => ({ ...r, updated_by: user?.user?.id })));
      console.log("✅ " + label + " seeded (" + rows.length + ")");
    } else { console.log("ℹ️  " + label + " skipped (" + count + " existing)"); }
  }

  console.log("\n✅ Setup complete!");
  console.log("   Login: http://localhost:3000/admin/login");
  console.log("   Email: " + email);
  rl.close();
}

main().catch(err => { console.error("❌ Setup failed:", err); process.exit(1); });
