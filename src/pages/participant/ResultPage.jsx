import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

export default function ResultPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [fullScore, setFullScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [congratsMessage, setCongratsMessage] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const attemptRef = doc(db, "quizAttempts", `${quizId}_${uid}`);
        const attemptSnap = await getDoc(attemptRef);
        if (!attemptSnap.exists()) {
          setResult(null);
          setLoading(false);
          return;
        }

        const attemptData = attemptSnap.data();
        setResult(attemptData);

        // Determine collection
        let collectionName = "quizzes";
        let quizSnap = await getDoc(doc(db, "quizzes", quizId));
        if (!quizSnap.exists()) {
          quizSnap = await getDoc(doc(db, "quizzes_links", quizId));
          if (!quizSnap.exists()) {
            alert("Quiz data not found!");
            navigate("/participant/active-quizzes");
            return;
          }
          collectionName = "quizzes_links";
        }

        // Fetch all questions
        const snapshot = await getDocs(collection(db, collectionName, quizId, "questions"));
        const questionsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setQuestions(questionsData);

        // Compute score
        let totalPoints = 0;
        let userScore = 0;
        questionsData.forEach((q) => {
          totalPoints += q.points || 4;
          if (attemptData.answers && attemptData.answers[q.id] === q.answer) {
            userScore += q.points || 4;
          }
        });
        setFullScore(totalPoints);
        setScore(userScore);

        // Update score & percentage in Firestore
        const percentage = totalPoints ? (userScore / totalPoints) * 100 : 0;
        await updateDoc(attemptRef, {
          score: userScore,
          percentage,
        });

        // Congrats message
        if (percentage >= 80) setCongratsMessage("Excellent! 🎉");
        else if (percentage >= 50) setCongratsMessage("Good Job! 🙂");
        else setCongratsMessage("Keep Trying! 💪");

      } catch (err) {
        console.error("Error fetching result:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [quizId, navigate]);

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
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          🎉 Your Quiz Result
        </h1>
        <h2 className="text-xl font-semibold text-center text-green-600 mb-6">
          {congratsMessage}
        </h2>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <div className="px-6 py-3 bg-green-100 text-green-800 rounded-lg font-semibold">
            Score: {score} / {fullScore}
          </div>
          <div className="px-6 py-3 bg-indigo-100 text-indigo-800 rounded-lg font-semibold">
            Time Taken: {result.timeTaken ?? "N/A"} sec
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg shadow-inner p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4 text-gray-800">Your Answers:</h2>
          <ul className="space-y-3">
            {questions.map((q, index) => {
              const userAns = result.answers[q.id];
              return (
                <li
                  key={q.id}
                  className="p-3 border rounded-lg flex flex-col sm:flex-row sm:justify-between bg-white border-gray-300"
                >
                  <span className="font-medium text-gray-700">Q{index + 1}</span>
                  <span className="text-gray-600">
                    Your Answer: {userAns ?? "Not answered"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

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
