import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function LeaderboardPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const attemptsRef = collection(db, "quizAttempts");
        const q = query(attemptsRef, where("quizId", "==", quizId));
        const snapshot = await getDocs(q);

        const attemptsData = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let email = data.email;

            if (!email && data.uid) {
              try {
                const userRef = doc(db, "users", data.uid);
                const userSnap = await getDoc(userRef);
                email = userSnap.exists() ? userSnap.data().email : data.uid;
              } catch {
                email = data.uid;
              }
            }

            return { id: docSnap.id, ...data, email };
          })
        );

        attemptsData.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.timeTaken - b.timeTaken;
        });

        setLeaders(attemptsData);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      }
    };

    fetchLeaderboard();
  }, [quizId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Title + Back */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h1>
        <button
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
          onClick={() => navigate("/organiser/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {leaders.length === 0 ? (
        <p className="text-gray-500 text-center text-lg mt-6">No attempts yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-indigo-600 text-white text-left">
                <th className="p-3">Rank</th>
                <th className="p-3">Email</th>
                <th className="p-3">Time</th>
                <th className="p-3">Score</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((user, index) => (
                <tr
                  key={user.id}
                  className={`border-t ${
                    index === 0
                      ? "bg-yellow-100"
                      : index === 1
                      ? "bg-gray-100"
                      : index === 2
                      ? "bg-orange-100"
                      : "bg-white"
                  } hover:bg-indigo-50 transition`}
                >
                  <td className="p-3 font-bold text-gray-800">
                    {index + 1 === 1 && "🥇"}
                    {index + 1 === 2 && "🥈"}
                    {index + 1 === 3 && "🥉"}
                    {index + 1 > 3 && index + 1}
                  </td>
                  <td className="p-3 text-gray-700 break-words">{user.email}</td>
                  <td className="p-3 text-gray-600">{formatTime(user.timeTaken)}</td>
                  <td className="p-3 font-semibold text-gray-800">{user.score ?? "-"}</td>
                  <td className="p-3">
                    <button
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs sm:text-sm"
                      onClick={() =>
                        navigate(`/organiser/quiz/${quizId}/user/${user.id}/answers`)
                      }
                    >
                      View Answers
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
