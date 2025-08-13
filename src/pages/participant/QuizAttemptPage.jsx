// src/pages/participant/QuizAttemptPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizWithQuestions } from "../../firebase/quizService";
import { auth } from "../../firebase/firebaseConfig";

export default function QuizAttemptPage() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      const data = await getQuizWithQuestions(quizId);
      setQuiz(data);
    };
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quiz) return;
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz]);

  if (!quiz) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-600">
        Loading...
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];

  const handleAnswer = (qid, ans) => {
    setAnswers((prev) => ({ ...prev, [qid]: ans }));
  };

  const handleSubmit = () => {
    navigate(`/participant/submit-confirmation/${quiz.id}`, {
      state: { answers, timeElapsed },
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
          <div className="px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg">
            ⏱ {formatTime(timeElapsed)}
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <p className="text-lg font-medium text-gray-800 mb-4">
            {currentIndex + 1}. {currentQuestion.question}
          </p>

          {currentQuestion.type === "MCQ" ? (
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                    answers[currentQuestion.id] === opt
                      ? "bg-indigo-50 border-indigo-500"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={opt}
                    checked={answers[currentQuestion.id] === opt}
                    onChange={() => handleAnswer(currentQuestion.id, opt)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              className="border border-gray-300 p-3 rounded-lg w-full text-gray-800 focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Write your answer..."
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              currentIndex === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ⬅ Prev
          </button>

          {currentIndex < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Next ➡
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              ✅ Submit
            </button>
          )}
        </div>

        {/* Progress Info */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          Question {currentIndex + 1} of {quiz.questions.length}
        </div>
      </div>
    </div>
  );
}
