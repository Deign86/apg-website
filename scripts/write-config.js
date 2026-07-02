const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

function w(rel, content) {
  fs.writeFileSync(path.join(root, rel), content, "utf8");
  console.log("wrote " + rel);
}

// .firebaserc
w(".firebaserc", JSON.stringify({
  projects: { default: "alphapremier-group" }
}, null, 2) + "\n");

// firebase.json
w("firebase.json", JSON.stringify({
  firestore: { rules: "firestore.rules", indexes: "firestore.indexes.json" },
  storage: { rules: "storage.rules" },
  hosting: {
    public: ".",
    ignore: [
      "firebase.json","firestore.rules","firestore.indexes.json","storage.rules",
      ".firebaserc","package.json","package-lock.json",
      "scripts/**","functions/**","node_modules/**","vendor/**",
      "api/**","includes/**","database/**","website/**",".old_site/**",
      "*.php","assets/admin/backend/**","assets/admin/views/**",
      "pages/process_chat.php","pages/send_email.php","pages/contact_handler.php",
      "pages/chat_debug.log"
    ],
    rewrites: [{ source: "**", destination: "/404.html" }],
    cleanUrls: true
  }
}, null, 2) + "\n");

// firestore.indexes.json
w("firestore.indexes.json", JSON.stringify({
  indexes: [
    { collectionGroup: "offerings", queryScope: "COLLECTION",
      fields: [{fieldPath:"status",order:"ASCENDING"},{fieldPath:"created_at",order:"DESCENDING"}] },
    { collectionGroup: "offerings", queryScope: "COLLECTION",
      fields: [{fieldPath:"property_type",order:"ASCENDING"},{fieldPath:"created_at",order:"DESCENDING"}] },
    { collectionGroup: "offerings", queryScope: "COLLECTION",
      fields: [{fieldPath:"status",order:"ASCENDING"},{fieldPath:"property_type",order:"ASCENDING"},{fieldPath:"created_at",order:"DESCENDING"}] },
    { collectionGroup: "messages", queryScope: "COLLECTION_GROUP",
      fields: [{fieldPath:"created_at",order:"ASCENDING"}] }
  ],
  fieldOverrides: []
}, null, 2) + "\n");

// package.json
w("package.json", JSON.stringify({
  name: "apg-firebase-migration",
  version: "1.0.0",
  private: true,
  description: "Migration tooling for Alpha Premier Group PHP/MySQL -> Firebase",
  scripts: { migrate: "node scripts/migrate.js", "setup-roles": "node scripts/setup-roles.js" },
  dependencies: { "firebase-admin": "^12.7.0" }
}, null, 2) + "\n");

// firestore.rules
w("firestore.rules", `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'Moderator', 'moderator', 'admin'];
    }
    function isOwner() {
      return request.auth != null
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner';
    }

    match /users/{uid} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == uid || isOwner();
      allow update: if isOwner() || request.auth.uid == uid;
      allow delete: if isOwner();
    }

    match /offerings/{offeringId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();

      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.resource.data.user_name is string
                       && request.resource.data.user_name.size() > 0
                       && request.resource.data.user_name.size() <= 100
                       && request.resource.data.comment_text is string
                       && request.resource.data.comment_text.size() > 0
                       && request.resource.data.comment_text.size() <= 2000
                       && request.resource.data.property_id == offeringId;
        allow update, delete: if isAdmin();
      }

      match /ratings/{ratingId} {
        allow read: if true;
        allow create: if request.resource.data.rating is int
                       && request.resource.data.rating >= 1
                       && request.resource.data.rating <= 5
                       && request.resource.data.property_id == offeringId;
        allow update: if request.resource.data.rating is int
                       && request.resource.data.rating >= 1
                       && request.resource.data.rating <= 5
                       && request.resource.data.property_id == offeringId;
        allow delete: if false;
      }

      match /reactions/{reactionId} {
        allow read: if true;
        allow create: if request.resource.data.reaction_type == 'like'
                       && request.resource.data.property_id == offeringId;
        allow delete: if request.resource.data.reaction_type == 'like'
                       && request.resource.data.property_id == offeringId;
        allow update: if false;
      }
    }

    match /services/{serviceId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /careers/{careerId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /blogs/{blogId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /chatSessions/{sessionId} {
      allow read: if isAdmin()
                  || (request.auth == null
                      && resource.data.visitor_session_token == sessionId);
      allow create: if request.resource.data.visitor_name is string
                     && request.resource.data.visitor_name.size() <= 100;
      allow update: if isAdmin()
                     || resource.data.visitor_session_token == sessionId;
      allow delete: if isAdmin();

      match /messages/{messageId} {
        allow read: if isAdmin()
                    || (request.auth == null
                        && get(/databases/$(database)/documents/chatSessions/$(sessionId)).data.visitor_session_token == sessionId);
        allow create: if request.resource.data.message is string
                       && request.resource.data.message.size() > 0
                       && request.resource.data.message.size() <= 5000
                       && request.resource.data.sender_type in ['visitor', 'admin'];
        allow update, delete: if isAdmin();
      }
    }

    match /inquiries/{inquiryId} {
      allow read: if isAdmin();
      allow create: if request.resource.data.name is string
                     && request.resource.data.name.size() > 0
                     && request.resource.data.name.size() <= 200;
      allow update, delete: if isAdmin();
    }
  }
}
`);

// storage.rules
w("storage.rules", `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    match /realty/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && firestore.exists(/databases/(default)/documents/users/$(request.auth.uid));
    }

    match /admins/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /chat/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
`);

console.log("All config + rules files written without BOM.");
