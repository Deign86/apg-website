import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'alphapremier-group.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'alphapremier-group',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'alphapremier-group.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
