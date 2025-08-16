// src/pages/organiser/DashboardPage.jsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) setUserData(userSnap.data());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      if (!auth.currentUser) return;

      // Fetch from "quizzes" (Public)
      const q1 = query(
        collection(db, "quizzes"),
        where("organiserId", "==", auth.currentUser.uid)
      );
      const snapshot1 = await getDocs(q1);
      const publicQuizzes = snapshot1.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "public",
        source: "quizzes",
      }));

      // Fetch from "quizzes_links" (Private)
      const q2 = query(
        collection(db, "quizzes_links"),
        where("organiserId", "==", auth.currentUser.uid)
      );
      const snapshot2 = await getDocs(q2);
      const privateQuizzes = snapshot2.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "private",
        source: "quizzes_links",
      }));

      setQuizzes([...publicQuizzes, ...privateQuizzes]);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (id, active, source) => {
    if (!userData?.verified) return;
    try {
      await updateDoc(doc(db, source, id), { active: !active });
      fetchQuizzes();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteQuiz = async (id, source) => {
    if (!userData?.verified) return;
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await deleteDoc(doc(db, source, id));
      fetchQuizzes();
    } catch (err) {
      console.error(err);
    }
  };

  const requestVerification = async () => {
    try {
      const requestsRef = collection(db, "verificationRequests");
      await addDoc(requestsRef, {
        userId: auth.currentUser.uid,
        email: userData.email,
        requestedAt: new Date(),
        status: "pending",
      });
      alert("Verification request sent to admin!");
    } catch (err) {
      console.error(err);
      alert("Failed to request verification.");
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchQuizzes();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6 items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
          📋 My Quizzes
          {userData?.verified && (
            <span className="text-blue-500 font-bold text-lg" title="Verified">
              ✔️
            </span>
          )}
        </h1>

        <div className="flex gap-3">
          {!userData?.verified && (
            <button
              onClick={requestVerification}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition"
            >
              Request Verification
            </button>
          )}

          <button
            onClick={() => navigate("/organiser/create-quiz")}
            disabled={!userData?.verified}
            className={`px-4 py-2 font-medium rounded-lg transition ${userData?.verified
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            ➕ Create Quiz
          </button>

          {userData?.admin && (
            <button
              onClick={() => navigate("/admin")}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
            >
              🛠 Admin Page
            </button>
          )}
        </div>
      </div>

      {quizzes.length === 0 ? (
        <p className="text-gray-500 text-center text-lg mt-6">No quizzes found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md text-sm sm:text-base">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Active</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz, idx) => (
                <tr
                  key={`${quiz.source}-${quiz.id}`}
                  className={`border-t ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50 transition`}
                >
                  <td className="p-3 font-medium text-gray-800">{quiz.title}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${quiz.type === "public"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                        }`}
                      title={quiz.type === "public" ? "Open to all (Public Quiz)" : "Private Quiz"}
                    >
                      {quiz.type === "public" ? "Public" : "Private"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${quiz.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                        }`}
                    >
                      {quiz.active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/organiser/edit-quiz/${quiz.id}`)}
                      disabled={!userData?.verified}
                      className={`px-2 py-1 rounded text-xs sm:text-sm ${userData?.verified
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
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
                      onClick={() => toggleActive(quiz.id, quiz.active, quiz.source)}
                      disabled={!userData?.verified || quiz.type === "private"} // <-- disable for private
                      className={`px-2 py-1 text-white rounded text-xs sm:text-sm ${!userData?.verified || quiz.type === "private"
                          ? "bg-teal-400 text-green-900 cursor-not-allowed"
                          : quiz.active
                            ?  "bg-red-600 hover:bg-red-700"
                            :"bg-green-600 hover:bg-green-700"
                        }`}
                    >
                      {quiz.active ? "Deactivate" : "Activate"}
                    </button>


                    <button
                      onClick={() => deleteQuiz(quiz.id, quiz.source)}
                      disabled={!userData?.verified}
                      className={`px-2 py-1 rounded text-xs sm:text-sm ${userData?.verified ?
                          "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      🗑 Delete
                    </button>

                    <button
                      onClick={() => navigate(`/organiser/leaderboard/${quiz.id}`)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs sm:text-sm"
                    >
                      🏆 Leaderboard
                    </button>

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

                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/quiz/${quiz.id}`;
                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          url
                        )}`;
                        window.open(qrUrl, "_blank");
                      }}
                      className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs sm:text-sm"
                    >
                      📱 QR Code
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
