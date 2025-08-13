// src/pages/organiser/DashboardPage.jsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      const snapshot = await getDocs(collection(db, "quizzes"));
      setQuizzes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const toggleActive = async (id, active) => {
    try {
      await updateDoc(doc(db, "quizzes", id), { active: !active });
      fetchQuizzes();
    } catch (error) {
      console.error("Error updating quiz:", error);
    }
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await deleteDoc(doc(db, "quizzes", id));
      fetchQuizzes();
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">📋 Quizzes</h1>
        <button
          onClick={() => navigate("/organiser/create-quiz")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          ➕ Create Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <p className="text-gray-500 text-center text-lg mt-6">No quizzes found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md text-sm sm:text-base">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Active</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz, index) => (
                <tr
                  key={quiz.id}
                  className={`border-t ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-indigo-50 transition`}
                >
                  <td className="p-3 font-medium text-gray-800">{quiz.title}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${quiz.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                        }`}
                    >
                      {quiz.active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/organiser/edit-quiz/${quiz.id}`)}
                        className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs sm:text-sm"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => navigate(`/organiser/questions/${quiz.id}`)}
                        className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs sm:text-sm"
                      >
                        ❓ Questions
                      </button>
                      <button
                        onClick={() => toggleActive(quiz.id, quiz.active)}
                        className={`px-2 py-1 text-white rounded text-xs sm:text-sm ${quiz.active
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-600 hover:bg-gray-700"
                          }`}
                      >
                        {quiz.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => deleteQuiz(quiz.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm"
                      >
                        🗑 Delete
                      </button>
                      <button
                        onClick={() => navigate(`/organiser/leaderboard/${quiz.id}`)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs sm:text-sm"
                      >
                        🏆 Leaderboard
                      </button>

                      {/* New Copy Link button */}
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/quiz/${quiz.id}`;
                          navigator.clipboard.writeText(url);
                          alert("Quiz link copied!");
                        }}
                        className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs sm:text-sm"
                      >
                        🔗 Copy Link
                      </button>

                      {/* New Show QR button */}
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/quiz/${quiz.id}`;
                          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
                          window.open(qrUrl, "_blank");
                        }}
                        className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs sm:text-sm"
                      >
                        📱 QR Code
                      </button>

                    </div>
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
