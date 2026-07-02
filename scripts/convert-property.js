// scripts/convert-property.js
// Transforms property.php -> property.html: strip PHP, add Firebase + data loader.
var fs = require("fs");
var path = require("path");
var root = path.resolve(__dirname, "..");
var src = fs.readFileSync(path.join(root, "property.php"), "utf8");

// 1. Strip all <?php ... ?> blocks
src = src.replace(/<\?php[\s\S]*?\?>\s*/g, "");

// 2. Update nav links .php -> .html
src = src.replace(/href="(property|virtual_office)\.php"/g, function(m, p) {
  return 'href="' + p + '.html"';
});

// 3. Add Firebase SDK scripts before </head>
var fbSdk = [
  '  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>',
  '  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>',
  '  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>',
  '  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js"></script>'
].join("\n") + "\n";
src = src.replace("</head>", fbSdk + "</head>");

// 4. Add Firebase config init block before the first existing <script src=
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
src = src.replace('<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>', fbConfig + '<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>');

// 5. Add property-data-loader.js before the jQuery doc-ready block
var loader = fs.readFileSync(path.join(root, "js", "property-data-loader.js"), "utf8");
src = src.replace('<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>', '<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>\n<script>' + loader + '</script>');

// 6. Write
fs.writeFileSync(path.join(root, "property.html"), src, "utf8");
console.log("property.html written: " + src.length + " bytes");
