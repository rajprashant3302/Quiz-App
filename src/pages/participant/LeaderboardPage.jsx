import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function LeaderboardPage() {
  const { quizId: paramQuizId } = useParams();
  const [quizId, setQuizId] = useState(null);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const storedId = sessionStorage.getItem("quizId");
    setQuizId(paramQuizId || storedId);
  }, [paramQuizId]);

  useEffect(() => {
    if (!quizId) return;

    const fetchLeaders = async () => {
      try {
        const attemptsRef = collection(db, "quizAttempts");
        const q = query(attemptsRef, where("quizId", "==", quizId));
        const snapshot = await getDocs(q);
        const attemptsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const attemptsWithEmail = await Promise.all(
          attemptsData.map(async attempt => {
            try {
              const userDoc = await getDoc(doc(db, "users", attempt.uid));
              const email = userDoc.exists()
                ? userDoc.data().email
                : "Guest User";
              return { ...attempt, email };
            } catch {
              return { ...attempt, email: "Guest User" };
            }
          })
        );

        attemptsWithEmail.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.timeTaken - b.timeTaken;
        });

        setLeaders(attemptsWithEmail);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaders();
  }, [quizId]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
          🏆 Leaderboard
        </h1>

        {leaders.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No attempts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow text-sm sm:text-base">
              <thead>
                <tr className="bg-indigo-600 text-white text-left">
                  <th className="p-2 sm:p-3">Rank</th>
                  <th className="p-2 sm:p-3">User</th>
                  <th className="p-2 sm:p-3">Score</th>
                  <th className="p-2 sm:p-3">Time (sec)</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-indigo-50 transition`}
                  >
                    <td className="p-2 sm:p-3 font-semibold text-gray-700">
                      {index + 1}
                    </td>
                    <td className="p-2 sm:p-3 text-gray-700 break-words max-w-[180px] sm:max-w-none">
                      {user.email}
                    </td>
                    <td className="p-2 sm:p-3 font-bold text-green-600">
                      {user.score}
                    </td>
                    <td className="p-2 sm:p-3 text-gray-600">
                      {user.timeTaken}
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
