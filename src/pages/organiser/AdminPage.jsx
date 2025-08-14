// src/pages/admin/AdminPage.jsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all data
  const fetchAll = async () => {
    try {
      const [reqSnap, userSnap, quizSnap] = await Promise.all([
        getDocs(collection(db, "verificationRequests")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "quizzes")),
      ]);

      const usersData = userSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);

      // Map userId → email for quizzes
      const usersMap = {};
      usersData.forEach((u) => {
        usersMap[u.id] = u.email;
      });

      const quizzesData = quizSnap.docs.map((q) => ({
        id: q.id,
        ...q.data(),
        organiserEmail: usersMap[q.data().organiserId] || q.data().organiserId,
      }));

      setQuizzes(quizzesData);
      setRequests(reqSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Approve verification request
  const approveVerification = async (request) => {
    try {
      await updateDoc(doc(db, "users", request.userId), { verified: true });
      await deleteDoc(doc(db, "verificationRequests", request.id));
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      const reqSnap = await getDocs(collection(db, "verificationRequests"));
      reqSnap.docs.forEach(async (r) => {
        if (r.data().userId === userId) await deleteDoc(doc(db, "verificationRequests", r.id));
      });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle quiz active status
  const toggleActive = async (id, active) => {
    try {
      await updateDoc(doc(db, "quizzes", id), { active: !active });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete quiz
  const deleteQuiz = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await deleteDoc(doc(db, "quizzes", id));
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🛠 Admin Panel</h1>

      {/* Verification Requests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Pending Verification Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse rounded-lg shadow-md text-sm sm:text-base">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Requested At</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-t bg-white hover:bg-indigo-50 transition">
                    <td className="p-3">{req.email}</td>
                    <td className="p-3">{req.role || "organiser"}</td>
                    <td className="p-3">{new Date(req.requestedAt.seconds * 1000).toLocaleString()}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => approveVerification(req)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs sm:text-sm"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => deleteUser(req.userId)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm"
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

      {/* All Users */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">All Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse rounded-lg shadow-md text-sm sm:text-base">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Verified</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t bg-white hover:bg-indigo-50 transition">
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">
                      {user.verified ? <span className="text-blue-500 font-bold">✔️ Verified</span> : "❌ Not Verified"}
                    </td>
                    <td className="p-3 flex gap-2">
                      {!user.verified && (
                        <button
                          onClick={async () => {
                            await updateDoc(doc(db, "users", user.id), { verified: true });
                            fetchAll();
                          }}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs sm:text-sm"
                        >
                          ✅ Verify
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm"
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

      {/* All Quizzes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">All Quizzes</h2>
        {quizzes.length === 0 ? (
          <p className="text-gray-500">No quizzes found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg shadow-md text-sm sm:text-base">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Organiser</th>
                  <th className="p-3 text-left">Active</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-t bg-white hover:bg-indigo-50 transition">
                    <td className="p-3">{quiz.title}</td>
                    <td className="p-3">{quiz.organiserEmail}</td>
                    <td className="p-3">{quiz.active ? "✅ Active" : "❌ Inactive"}</td>
                    <td className="p-3 flex flex-wrap gap-2">
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
                        className={`px-2 py-1 text-white rounded text-xs sm:text-sm ${
                          quiz.active ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
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
                        📱 QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
