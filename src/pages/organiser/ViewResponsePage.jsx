import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useParams } from "react-router-dom";

export default function QuizReview() {
  const { quizId, userId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [quizTitle, setQuizTitle] = useState("");
  const [score, setScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quiz title
        const quizRef = doc(db, "quizzes", quizId);
        const quizSnap = await getDoc(quizRef);
        if (quizSnap.exists()) {
          setQuizTitle(quizSnap.data().title || "Quiz Review");
        }

        // Fetch questions
        const questionsRef = collection(db, `quizzes/${quizId}/questions`);
        const questionsSnap = await getDocs(questionsRef);
        const questionsData = questionsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch attempt data
        const attemptRef = doc(db, "quizAttempts", userId);
        const attemptSnap = await getDoc(attemptRef);
        let answersMap = {};
        if (attemptSnap.exists()) {
          const attemptData = attemptSnap.data();
          answersMap = attemptData.answers || {};
          setScore(attemptData.score || 0);
          setTimeTaken(attemptData.timeTaken || "");
        }

        setQuestions(questionsData);
        setResponses(answersMap);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, userId]);

  if (loading) {
    return <p className="text-center mt-10 text-lg text-gray-500">Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Quiz Title & Stats */}
      <div className="bg-indigo-600 text-white rounded-lg p-4 shadow mb-6">
        <h1 className="text-2xl font-bold">{quizTitle}</h1>
        <div className="flex flex-wrap gap-4 mt-2 text-lg">
          <p><span className="font-semibold">Score:</span> {score} / {4*questions.length}</p>
          <p><span className="font-semibold">Time Taken:</span> {timeTaken}s</p>
        </div>
      </div>

      {/* Questions Review */}
      {questions.map((q, index) => {
        const selectedAnswer = responses[q.id] || null;
        const isCorrect = selectedAnswer === q.answer;

        return (
          <div
            key={q.id}
            className="bg-white border rounded-lg shadow-sm p-4 mb-5 hover:shadow-md transition"
          >
            <p className="font-semibold text-gray-800 text-lg">
              {index + 1}. {q.question}
            </p>

            {/* Multiple Choice */}
            {q.options && q.options.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, i) => {
                  const isUserChoice = selectedAnswer === opt;
                  const isRightAnswer = q.answer === opt;

                  let bg = "bg-gray-100";
                  let border = "border-gray-300";

                  if (isUserChoice && isCorrect) {
                    bg = "bg-green-200";
                    border = "border-green-500";
                  } else if (isUserChoice && !isCorrect) {
                    bg = "bg-red-200";
                    border = "border-red-500";
                  } else if (!isUserChoice && isRightAnswer) {
                    bg = "bg-green-100";
                    border = "border-green-400";
                  }

                  return (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border ${bg} ${border} text-center`}
                    >
                      {opt}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fill in the blank */
              <div className="mt-3 space-y-1 text-gray-700">
                <p>
                  <span className="font-semibold">Your Answer:</span>{" "}
                  {selectedAnswer || <em className="text-gray-500">No answer given</em>}
                </p>
                <p>
                  <span className="font-semibold">Correct Answer:</span> {q.answer}
                </p>
              </div>
            )}

            {/* Correct / Incorrect Tag */}
            <div className="mt-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  isCorrect
                    ? "bg-green-100 text-green-700 border border-green-400"
                    : "bg-red-100 text-red-700 border border-red-400"
                }`}
              >
                {isCorrect ? "✅ Correct" : "❌ Incorrect"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
