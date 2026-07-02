var fs = require("fs");
var p = "C:\\Users\\Deign\\Downloads\\Original APG Website";

// Fix contactform.html remaining .php href
var cf = fs.readFileSync(p + "\\pages\\contactform.html", "utf8");
var m = cf.match(/href="[^"]+\.php"/g);
console.log("contactform .php hrefs:", m);
// Fix by replacing all remaining .php hrefs
cf = cf.replace(/href="([^"]+)\.php"/g, 'href="$1.html"');
// But .php links to external sites should be kept... check what we replaced
var changed = cf.match(/href="[^"]+\.html"/g);
console.log("After fix .html hrefs:", changed);
fs.writeFileSync(p + "\\pages\\contactform.html", cf, "utf8");
console.log("contactform.html fixed");

// Check realty-offers.html Firebase presence
var ro = fs.readFileSync(p + "\\pages\\subsidiaries\\realty\\realty-offers.html", "utf8");
console.log("realty-offers Firebase:", ro.includes("firebase.initializeApp"));
console.log("realty-offers size:", ro.length);
if (!ro.includes("firebase.initializeApp")) {
  // Add Firebase manually
  var fbSdk = '<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>\n  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>\n  ';
  var fbConfig = '<script>var firebaseConfig = {apiKey:"AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",authDomain:"alphapremier-group.firebaseapp.com",projectId:"alphapremier-group",storageBucket:"alphapremier-group.appspot.com",messagingSenderId:"000000000000",appId:"1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx"};firebase.initializeApp(firebaseConfig);</script>\n';
  ro = ro.replace("</head>", fbSdk + "</head>");
  ro = ro.replace('<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>', fbConfig + '<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>');
  fs.writeFileSync(p + "\\pages\\subsidiaries\\realty\\realty-offers.html", ro, "utf8");
  console.log("realty-offers.html Firebase added");
}

console.log("Fixes applied.");
