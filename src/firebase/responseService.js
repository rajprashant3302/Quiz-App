// src/firebase/responseService.js
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";

// Submit user answers
export const submitQuizResponse = async (quizId, userId, answers, timeTaken) => {
  return await addDoc(collection(db, "responses"), {
    quizId,
    userId,
    answers,
    timeTaken,
    submittedAt: new Date()
  });
};

// Get leaderboard for quiz
export const getLeaderboard = async (quizId) => {
  const q = query(
    collection(db, "responses"),
    where("quizId", "==", quizId),
    orderBy("timeTaken", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Get user response for a quiz
export const getUserResponse = async (quizId, userId) => {
  const q = query(
    collection(db, "responses"),
    where("quizId", "==", quizId),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};
