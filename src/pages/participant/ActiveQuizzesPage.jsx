// src/pages/participant/ActiveQuizzesPage.jsx
import { useEffect, useState } from "react";
import { getDocs, query, where, collection, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function ActiveQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState({});
  const [user, setUser] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(""); // "Verified", "Pending", "Not Verified"
  const navigate = useNavigate();
  const uid = auth.currentUser.uid;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser(userData);
          if (userData.verified) {
            setVerificationStatus("Verified ✅");
          } else {
            // Check if pending verification request
            const reqQuery = query(
              collection(db, "verificationRequests"),
              where("userId", "==", uid)
            );
            const reqSnap = await getDocs(reqQuery);
            setVerificationStatus(reqSnap.empty ? "Not Verified ❌" : "Pending ⏳");
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    const fetchQuizzes = async () => {
      try {
        const q = query(collection(db, "quizzes"), where("active", "==", true));
        const snapshot = await getDocs(q);
        const quizzesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setQuizzes(quizzesData);

        const attempts = {};
        for (let quiz of quizzesData) {
          const attemptRef = doc(db, "quizAttempts", `${quiz.id}_${uid}`);
          const attemptSnap = await getDoc(attemptRef);
          if (attemptSnap.exists()) {
            attempts[quiz.id] = true;
          }
        }
        setAttemptedQuizzes(attempts);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
      }
    };

    fetchUser();
    fetchQuizzes();
  }, [uid]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8">
        {/* User Info */}
        {user && (
          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-gray-700">
              Logged in as: <span className="text-indigo-600">{user.email}</span>
            </p>
            <p className={`text-sm font-medium ${verificationStatus.includes("Verified") ? "text-green-600" : verificationStatus.includes("Pending") ? "text-yellow-600" : "text-red-600"}`}>
              {verificationStatus}
            </p>
          </div>
        )}

        {/* Page Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 mb-6 sm:mb-8">
          Active Quizzes
        </h1>

        {/* Quizzes */}
        {quizzes.length === 0 ? (
          <p className="text-center text-gray-600 font-medium">
            No active quizzes available.
          </p>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-4 sm:p-6 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl shadow-lg text-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
              >
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold">{quiz.title}</h2>
                  <p className="text-sm sm:text-base opacity-90">
                    {quiz.guidelines?.slice(0, 100)}
                    {quiz.guidelines?.length > 100 ? "..." : ""}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  {attemptedQuizzes[quiz.id] ? (
                    <button
                      disabled
                      className="px-4 sm:px-5 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed shadow-md w-full sm:w-auto"
                    >
                      Attempted
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/participant/guidelines/${quiz.id}`)}
                      className="px-4 sm:px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-all duration-300 w-full sm:w-auto"
                    >
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/participant/leaderboard/${quiz.id}`)}
                    className="px-4 sm:px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-md transition-all duration-300 w-full sm:w-auto"
                  >
                    Leaderboard
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
