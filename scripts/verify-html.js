const fs = require("fs");
const f = fs.readFileSync("C:\\Users\\Deign\\Downloads\\Original APG Website\\property.html", "utf8");

console.log("Size:", f.length, "bytes");
console.log("PHP tags:", (f.match(/<\?php/g) || []).length);
console.log("Has firebase:", f.includes("firebase.initializeApp"));
console.log("Has loadProperties:", f.includes("loadProperties"));
console.log("Has property.html:", f.includes("property.html"));
console.log("Has virtual_office.php:", f.includes("virtual_office.php"));

const start = f.substring(0, 80).replace(/\n/g, "\\n");
console.log("Starts with:", start);

const end = f.substring(f.length - 80).replace(/\n/g, "\\n");
console.log("Ends with:", end);

// Check for remaining PHP hrefs
const m = f.match(/href="[^"]*\.php"/g);
if (m) console.log(".php hrefs found:", m.join(", "));
else console.log("No .php hrefs found - good");
