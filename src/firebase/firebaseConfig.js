import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDe7vABlcrQ_pYv4awLTR16qZCOTkrZdsU",
  authDomain: "quiz-app-cb3c6.firebaseapp.com",
  projectId: "quiz-app-cb3c6",
  storageBucket: "quiz-app-cb3c6.appspot.com",
  messagingSenderId: "673477576127",
  appId: "1:673477576127:web:71ea894330739c7e5a4d0a",
  measurementId: "G-N2XFMX4M7Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optional: Analytics
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

// ✅ Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider(); // ✅ added
