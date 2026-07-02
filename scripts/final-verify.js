const fs = require("fs");
const p = "C:\\Users\\Deign\\Downloads\\Original APG Website";
const files = [
  "property.html","virtual_office.html","index.html","blogs.html","careers.html",
  "pages/contactform.html","pages/subsidiaries/realty/realty-offers.html"
];
files.forEach(function(x) {
  var f = p + "\\" + x.replace(/\//g, "\\");
  if (!fs.existsSync(f)) { console.log(x + ": NOT FOUND"); return; }
  var c = fs.readFileSync(f, "utf8");
  var phps = (c.match(/\<\?php/g) || []).length;
  var dotPhps = (c.match(/href="[^"]+\.php"/g) || []).length;
  var fb = c.includes("firebase.initializeApp") ? "Y" : "N";
  console.log(x + " -> PHP:" + phps + " .php-href:" + dotPhps + " Firebase:" + fb + " size:" + c.length);
});
console.log("Verify complete.");
