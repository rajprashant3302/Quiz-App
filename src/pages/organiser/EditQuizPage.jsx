import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate, useParams } from "react-router-dom";

export default function EditQuizPage() {
  const { quizId } = useParams();
  const [title, setTitle] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const snap = await getDoc(doc(db, "quizzes", quizId));
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title || "");
          setGuidelines(data.guidelines || "");
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      alert("Quiz title is required!");
      return;
    }
    try {
      await updateDoc(doc(db, "quizzes", quizId), { title, guidelines });
      alert("Quiz updated successfully!");
      navigate("/organiser/dashboard");
    } catch (error) {
      console.error("Error updating quiz:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading quiz...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📝 Edit Quiz</h1>

        {/* Quiz Title */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter quiz title"
          className="w-full border border-gray-300 rounded-lg p-3 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
        />

        {/* Guidelines */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Guidelines</label>
        <textarea
          value={guidelines}
          onChange={(e) => setGuidelines(e.target.value)}
          placeholder="Enter quiz guidelines..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-3 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6"
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/organiser/dashboard")}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition"
          >
            Update Quiz ✅
          </button>
        </div>
      </div>
    </div>
  );
}
