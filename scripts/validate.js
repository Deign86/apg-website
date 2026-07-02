const fs = require("fs");
const files = [".firebaserc","firebase.json","firestore.indexes.json","package.json"];
for (const f of files) {
  try { JSON.parse(fs.readFileSync(f, "utf8")); console.log(f + " - valid JSON"); }
  catch(e) { console.error(f + " - INVALID: " + e.message); process.exit(1); }
}
console.log("All JSON config files are valid.");
