// src/pages/participant/ResultPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

export default function ResultPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setResult(null);
          setLoading(false);
          return;
        }
        const docRef = doc(db, "quizAttempts", `${quizId}_${uid}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setResult(docSnap.data());
        } else {
          setResult({});
        }
      } catch (err) {
        console.error("Error fetching result:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-600">
        Loading...
      </div>
    );
  }

  if (!result || !result.answers) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 text-lg font-semibold">
        No result found for this quiz.
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          🎉 Your Quiz Result
        </h1>

        {/* Score & Time */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <div className="px-6 py-3 bg-green-100 text-green-800 rounded-lg font-semibold">
            Score:{" "}
            {result.score !== undefined ? result.score : "Pending evaluation"}
          </div>
          <div className="px-6 py-3 bg-indigo-100 text-indigo-800 rounded-lg font-semibold">
            Time Taken:{" "}
            {result.timeTaken !== undefined
              ? `${result.timeTaken} sec`
              : "N/A"}
          </div>
        </div>

        {/* Answers */}
        <div className="bg-gray-50 rounded-lg shadow-inner p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4 text-gray-800">
            Your Answers:
          </h2>
          <ul className="space-y-3">
            {Object.entries(result.answers).map(([qid, ans], index) => (
              <li
                key={qid}
                className="p-3 bg-white border rounded-lg shadow-sm flex flex-col sm:flex-row sm:justify-between"
              >
                <span className="font-medium text-gray-700">
                  Q{index + 1}
                </span>
                <span className="text-gray-600">{ans}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate("/participant/active-quizzes")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
