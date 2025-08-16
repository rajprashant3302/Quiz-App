// src/pages/participant/SubmitConfirmationPage.jsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig";
import { db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";

export default function SubmitConfirmationPage() {
  const { quizId } = useParams(); // Could be linkId or quizId
  const { state } = useLocation(); // contains answers + timeElapsed
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [realQuizId, setRealQuizId] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Step 1: Try quizzes_links first
        const linkDocRef = doc(db, "quizzes_links", quizId);
        const linkDocSnap = await getDoc(linkDocRef);

        if (linkDocSnap.exists()) {
          const linkData = linkDocSnap.data();
          const linkQuestionsRef = collection(db, "quizzes_links", quizId, "questions");
          const linkQuestionsSnap = await getDocs(linkQuestionsRef);
          const linkQuestions = linkQuestionsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          setQuiz({ id: quizId, ...linkData, questions: linkQuestions });
          setRealQuizId(linkData.quizId || quizId); // fallback
          return;
        }

        // Step 2: Fallback to quizzes
        const quizDocRef = doc(db, "quizzes", quizId);
        const quizDocSnap = await getDoc(quizDocRef);

        if (quizDocSnap.exists()) {
          const quizData = quizDocSnap.data();
          const questionsRef = collection(db, "quizzes", quizId, "questions");
          const questionsSnap = await getDocs(questionsRef);
          const questions = questionsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          setQuiz({ id: quizId, ...quizData, questions });
          setRealQuizId(quizId);
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleSubmit = async () => {
    try {
      const uid = auth.currentUser?.uid;

      if (!uid || !realQuizId) {
        console.error("Missing user ID or quiz ID");
        return;
      }

      // Calculate score first
      const totalQuestions = quiz.questions.length;
      let correctAnswers = 0;
      quiz.questions.forEach((q) => {
        if (
          state.answers[q.id] &&
          state.answers[q.id].trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()
        ) {
          correctAnswers++;
        }
      });
      const percentage = (correctAnswers / totalQuestions) * 100;

      const docId = `${realQuizId}_${uid}`; // quizId_uid format

      // Save attempt in the required format
      await setDoc(doc(db, "quizAttempts", docId), {
        answers: state.answers,          
        quizId: realQuizId,
        uid: uid,
        score: correctAnswers,           
        submittedAt: new Date(),
        timeTaken: state.timeElapsed || 0,
        percentage: percentage
      });

      // Save score in session for result page
      sessionStorage.setItem("quizScore", percentage);

      // Navigate to result page
      navigate(`/participant/result/${realQuizId}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  if (!quiz) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Review Your Answers
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Double-check your responses before submitting.
        </p>

        <div className="space-y-4">
          {quiz.questions.map((q, index) => {
            const userAnswer = state.answers[q.id];
            const isAnswered = userAnswer && userAnswer.trim() !== "";
            return (
              <div
                key={q.id}
                className={`p-5 rounded-lg border shadow-sm ${
                  isAnswered
                    ? "bg-gray-50 border-gray-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <p className="font-semibold mb-2 text-gray-800">
                  {index + 1}. {q.question}
                </p>
                <p
                  className={`mb-4 ${
                    isAnswered ? "text-gray-700" : "text-red-600 font-medium"
                  }`}
                >
                  {isAnswered ? `Your answer: ${userAnswer}` : "Not answered"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            ✅ Submit Final
          </button>
        </div>
      </div>
    </div>
  );
}
