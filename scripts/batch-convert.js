// scripts/batch-convert.js — Phase 1: virtual_office + static nav links
var fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
function r(p) { return fs.readFileSync(path.join(root, p), "utf8"); }
function w(p, c) { fs.writeFileSync(path.join(root, p), c, "utf8"); console.log("  wrote " + p); }

var fbSdk = [
  '<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>',
  '<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>',
  '<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>',
  '<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js"></script>'
].join("\n  ") + "\n  ";

var fbConfig = [
  "<script>",
  'var firebaseConfig = {',
  '  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",',
  '  authDomain: "alphapremier-group.firebaseapp.com",',
  '  projectId: "alphapremier-group",',
  '  storageBucket: "alphapremier-group.appspot.com",',
  '  messagingSenderId: "000000000000",',
  '  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx"',
  "};",
  "firebase.initializeApp(firebaseConfig);",
  "</script>"
].join("\n") + "\n";

// === 1. Convert virtual_office.php ===
console.log("--- virtual_office.php ---");
var vo = r("virtual_office.php");
vo = vo.replace(/<\?php[\s\S]*?\?>\s*/g, "");
vo = vo.replace(/href="(property|virtual_office)\.php"/g, function(m,p){return 'href="'+p+'.html"';});
vo = vo.replace("</head>", fbSdk + "</head>");
vo = vo.replace('<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>', fbConfig + '<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>');
var voLoader = r("js/virtual-office-data-loader.js");
vo = vo.replace('<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>', '<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>\n' + voLoader + '\n');
w("virtual_office.html", vo);

// === 2. Update nav links in static pages ===
console.log("--- static nav links ---");
["index.html","blogs.html","careers.html","pages/contactform.html"].forEach(function(f) {
  var p = path.join(root, f);
  if (!fs.existsSync(p)) return;
  var c = fs.readFileSync(p, "utf8");
  c = c.replace(/href="(property|virtual_office)\.php"/g, function(m,p2){return 'href="'+p2+'.html"';});
  w(f, c);
});

console.log("Phase 1 done. Run phase 2 next.");
