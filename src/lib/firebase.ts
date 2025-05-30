// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Hardcoded as per user request
const firebaseConfig = {
  apiKey: "AIzaSyDqDQ13Wy_WT-vGyzkKCEd4hgMEyHb-zzo",
  authDomain: "coffeespot-booking.firebaseapp.com",
  projectId: "coffeespot-booking",
  storageBucket: "coffeespot-booking.appspot.com",
  messagingSenderId: "442607128940",
  appId: "1:442607128940:web:d07d42a2329e0bb6f6e349"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, db, storage };
