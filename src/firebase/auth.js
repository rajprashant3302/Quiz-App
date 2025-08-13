// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider, db } from "./firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Register with email and password
 */
export const registerWithEmail = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Login with email and password
 */
export const loginWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Google Sign-In / Sign-Up
 */
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

/**
 * Logout
 */
export const logoutUser = () => {
  return signOut(auth);
};

/**
 * Auth state listener
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Save user role in Firestore
 */
export const saveUserRole = async (uid, role, email) => {
  await setDoc(doc(db, "users", uid), {
    role,
    email,
    createdAt: new Date()
  });
};

/**
 * Fetch user role from Firestore
 */
export const getUserRole = async (uid) => {
  const docSnap = await getDoc(doc(db, "users", uid));
  if (docSnap.exists()) {
    return docSnap.data().role;
  }
  return null; // No role found
};
