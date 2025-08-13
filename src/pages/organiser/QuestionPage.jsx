import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function QuestionsListPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);

  const fetchQuestions = async () => {
    try {
      const snapshot = await getDocs(collection(db, "quizzes", quizId, "questions"));
      setQuestions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteDoc(doc(db, "quizzes", quizId, "questions", questionId));
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header with Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 Questions</h1>
        <button
          onClick={() => navigate(`/organiser/add-question/${quizId}`)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition"
        >
          ➕ Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <p className="text-gray-500 text-center text-lg mt-6">
          No questions found for this quiz.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="p-3 text-left">Question</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Answer</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, index) => (
                <tr
                  key={q.id}
                  className={`border-t hover:bg-indigo-50 transition ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 text-gray-800">{q.question}</td>
                  <td className="p-3 text-gray-700 capitalize">{q.type}</td>
                  <td className="p-3 text-gray-600">{q.answer}</td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        navigate(`/organiser/questions/${quizId}/${q.id}`)
                      }
                      className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded shadow text-xs sm:text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded shadow text-xs sm:text-sm"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
