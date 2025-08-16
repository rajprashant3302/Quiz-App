// src/pages/participant/GuidelinesPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function GuidelinesPage() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // First check in the open quizzes collection
        let quizRef = doc(db, "quizzes", quizId);
        let snap = await getDoc(quizRef);

        if (!snap.exists()) {
          // If not found, check in link-only quizzes
          quizRef = doc(db, "quizzes_links", quizId);
          snap = await getDoc(quizRef);

          if (!snap.exists()) {
            alert("Quiz not found!");
            navigate("/participant/active-quizzes");
            return;
          }
        }

        setQuiz({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error(err);
        alert("Failed to fetch quiz data!");
        navigate("/participant/active-quizzes");
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  if (!quiz)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-medium">
        Loading...
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
        
        {/* Quiz Title */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          {quiz.title} - <span className="text-indigo-600">Guidelines</span>
        </h1>
        
        {/* Guidelines Box */}
        <div className="p-6 bg-gray-50 text-gray-700 rounded-xl mb-6 border border-gray-200 leading-relaxed">
          <p className="whitespace-pre-line">{quiz.guidelines}</p>
        </div>
        
        {/* Start Quiz Button */}
        <div className="text-center">
          <button
            onClick={() => navigate(`/participant/quiz-attempt/${quiz.id}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            🚀 Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
