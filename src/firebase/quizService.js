// src/firebase/quizService.js
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  setDoc
} from "firebase/firestore";

// Create new quiz
export const createQuiz = async (quizData) => {
  return await addDoc(collection(db, "quizzes"), {
    ...quizData,
    createdAt: new Date(),
    active: false
  });
};

// Get all quizzes for organiser
export const getQuizzesByOrganiser = async (organiserId) => {
  const q = query(collection(db, "quizzes"), where("organiserId", "==", organiserId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Activate or deactivate quiz
export const setQuizActiveStatus = async (quizId, status) => {
  const quizRef = doc(db, "quizzes", quizId);
  return await updateDoc(quizRef, { active: status });
};

// Add question to quiz
export const addQuestionToQuiz = async (quizId, questionData) => {
  const questionsRef = collection(db, "quizzes", quizId, "questions");
  return await addDoc(questionsRef, questionData);
};

// Edit question
export const editQuestion = async (quizId, questionId, updatedData) => {
  const questionRef = doc(db, "quizzes", quizId, "questions", questionId);
  return await updateDoc(questionRef, updatedData);
};

// Delete question
export const deleteQuestion = async (quizId, questionId) => {
  const questionRef = doc(db, "quizzes", quizId, "questions", questionId);
  return await deleteDoc(questionRef);
};

// Get quiz details with questions
export const getQuizWithQuestions = async (quizId) => {
  const quizRef = doc(db, "quizzes", quizId);
  const quizSnap = await getDoc(quizRef);
  if (!quizSnap.exists()) return null;

  const questionsSnap = await getDocs(collection(db, "quizzes", quizId, "questions"));
  const questions = questionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return { id: quizId, ...quizSnap.data(), questions };
};


// Submit quiz answers and calculate score
// Submit quiz answers and calculate score
export const submitQuiz = async (quizId, uid, answers, timeTaken) => {
  const quizRef = doc(db, "quizzes", quizId);
  const quizSnap = await getDoc(quizRef);

  if (!quizSnap.exists()) throw new Error("Quiz not found");

  // Get questions from subcollection
  const questionsSnap = await getDocs(collection(db, "quizzes", quizId, "questions"));
  const questions = questionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Calculate score
  let score = 0;
  questions.forEach(q => {
    const userAnswer = answers[q.id];
    if (!userAnswer) return;

    if (q.type === "MCQ" && userAnswer === q.answer) score += 4;
    else if (q.type === "FILL_BLANK" && userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()) score += 4;
  });

  // Store in Firestore
  const attemptRef = doc(db, "quizAttempts", `${quizId}_${uid}`);
  await setDoc(attemptRef, {
    quizId,
    uid,
    answers,
    score,
    timeTaken,       // passed from frontend
    submittedAt: new Date()
  });
};

export async function getQuizFromLink(quizId) {
  try {
    const quizRef = doc(db, "quizzes_links", quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) {
      throw new Error("Quiz not found");
    }

    // Get questions from the quizzes_links/{quizId}/questions subcollection
    const questionsSnap = await getDocs(
      collection(db, "quizzes_links", quizId, "questions")
    );

    const questions = questionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { id: quizSnap.id, ...quizSnap.data(), questions };
  } catch (err) {
    console.error("Error fetching quiz from link:", err);
    throw err;
  }
}
