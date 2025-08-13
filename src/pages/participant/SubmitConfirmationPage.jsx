// src/pages/participant/SubmitConfirmationPage.jsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig";
import { getQuizWithQuestions, submitQuiz } from "../../firebase/quizService";
import { useEffect, useState } from "react";

export default function SubmitConfirmationPage() {
  const { quizId } = useParams();
  const { state } = useLocation(); // contains answers and timeElapsed
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      const data = await getQuizWithQuestions(quizId);
      setQuiz(data);
    };
    fetchQuiz();
  }, [quizId]);

  const handleSubmit = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await submitQuiz(quizId, uid, state.answers, state.timeElapsed);
    navigate(`/participant/result/${quizId}`);
  };

  const handleEditAnswer = (questionIndex) => {
    navigate(`/participant/attempt/${quizId}`, {
      state: {
        initialQuestionIndex: questionIndex,
        initialAnswers: state.answers,
        startTimeOffset: state.timeElapsed // resume timer
      }
    });
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
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Review Your Answers
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Double-check your responses before submitting.  
          You can edit any question if needed.
        </p>

        {/* Questions Review */}
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
                  {isAnswered
                    ? `Your answer: ${userAnswer}`
                    : "Not answered"}
                </p>
                <button
                  onClick={() => handleEditAnswer(index)}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  Edit Answer
                </button>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            Go Back
          </button>
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
