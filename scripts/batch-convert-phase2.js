// scripts/batch-convert-phase2.js — realty-offers + contactform EmailJS conversion
var fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
function r(p) { return fs.readFileSync(path.join(root, p), "utf8"); }
function w(p, c) { fs.writeFileSync(path.join(root, p), c, "utf8"); console.log("  wrote " + p); }

var fbSdk = [
  '<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>',
  '<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>'
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

// === 1. Convert realty-offers.html to use Firestore ===
console.log("--- realty-offers.html ---");
var roPath = path.join(root, "pages", "subsidiaries", "realty", "realty-offers.html");
if (fs.existsSync(roPath)) {
  var ro = fs.readFileSync(roPath, "utf8");
  ro = ro.replace("</head>", fbSdk + "</head>");
  ro = ro.replace("api/realty.php", "Firestore (via Firebase SDK)");
  ro = ro.replace('<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>', fbConfig + '<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>');

  // Replace the fetch-based loadProperties with Firestore
  var fsLoader = [
    "    async function loadProperties() {",
    "      try {",
    "        var snap = await firebase.firestore().collection('offerings').orderBy('created_at','desc').get();",
    "        allProperties = [];",
    "        snap.forEach(function(doc){ var d=doc.data(); d.id=doc.id; allProperties.push(d); });",
    "        applyFilters();",
    "      } catch(err) { console.error('Firestore load err:', err); }",
    "    }"
  ].join("\n");

  // Replace the fetch-based loadProperties
  var searchStr = "async function loadProperties()";
  var idx = ro.indexOf(searchStr);
  if (idx >= 0) {
    var endIdx = ro.indexOf("applyFilters", idx) + "applyFilters();".length;
    var before = ro.substring(0, idx);
    var after = ro.substring(endIdx);
    ro = before + fsLoader + after;
    console.log("  replaced fetch-based loadProperties with Firestore");
  }

  fs.writeFileSync(roPath, ro, "utf8");
  console.log("  done realty-offers.html");
} else {
  console.log("  skip realty-offers.html (not found)");
}

// === 2. Update contactform.html with EmailJS ===
console.log("--- contactform.html ---");
var cfPath = path.join(root, "pages", "contactform.html");
if (fs.existsSync(cfPath)) {
  var cf = fs.readFileSync(cfPath, "utf8");
  var emailJsSdk = '<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>';
  cf = cf.replace("</head>", fbSdk + emailJsSdk + "\n  </head>");
  cf = cf.replace('<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>', fbConfig + '<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>');
  cf = cf.replace(/action="[^"]*\.php"/g, 'action="#"');

  // Add onsubmit to forms that don't have it
  cf = cf.replace(/(<form[^>]*?)(\s*>)/g, function(m, before, after) {
    if (before.indexOf("onsubmit") >= 0) return m;
    return before + ' onsubmit="return sendInquiry(event)"' + after;
  });

  // Add EmailJS init + send function
  var emailJsFunc = [
    "<script>",
    "(function(){",
    "  emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');",
    "  window.sendInquiry = function(e) {",
    "    e.preventDefault();",
    "    var btn = e.target.querySelector('[type=submit]');",
    "    if(btn) { btn.disabled = true; btn.textContent = 'Sending...'; }",
    "    var form = e.target;",
    "    function g(n) { return (form.querySelector('[name=\"'+n+'\"]')||{}).value || ''; }",
    "    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {",
    "      name: g('name'), email: g('email'), contact: g('contact'),",
    "      message: g('message') || g('note'),",
    "      property_type: g('property_type'), business: g('business'),",
    "      sqm: g('sqm'), location: g('location')",
    "    }).then(function() {",
    "      alert('Inquiry sent! We will contact you soon.');",
    "      form.reset();",
    "    }).catch(function() {",
    "      alert('Failed to send. Please try again.');",
    "    }).finally(function() {",
    "      if(btn) { btn.disabled = false; btn.textContent = 'Send Inquiry'; }",
    "    });",
    "    return false;",
    "  };",
    "})();",
    "</script>"
  ].join("\n");
  cf = cf.replace("</body>", emailJsFunc + "</body>");
  fs.writeFileSync(cfPath, cf, "utf8");
  console.log("  done contactform.html");
} else {
  console.log("  skip (not found)");
}

console.log("Phase 2 complete.");
