// src/pages/organiser/CreateQuizPage.jsx
import { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function CreateQuizPage() {
  const [title, setTitle] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch current user data to check verification
  const fetchUserData = async () => {
    try {
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setVerified(userSnap.data().verified || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Quiz title is required!");
      return;
    }

    if (!verified) {
      alert("You are not verified to create quizzes!");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "quizzes"), {
        title: title.trim(),
        guidelines: guidelines.trim(),
        active: false,
        createdAt: serverTimestamp(),
        organiserId: auth.currentUser.uid, // store organiser ID
      });
      navigate(`/organiser/add-question/${docRef.id}`);
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Failed to create quiz");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📝 Create New Quiz</h1>

        {/* Quiz Title */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
        <input
          className="border border-gray-300 rounded-lg p-3 w-full mb-4 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Enter quiz title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Guidelines */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Guidelines (optional)</label>
        <textarea
          className="border border-gray-300 rounded-lg p-3 w-full mb-6 text-black h-28 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Add instructions or guidelines for participants..."
          value={guidelines}
          onChange={(e) => setGuidelines(e.target.value)}
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/organiser/dashboard")}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!verified}
            className={`flex-1 px-4 py-3 rounded-lg transition font-medium ${
              verified
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save & Add Questions →
          </button>
        </div>

        {!verified && (
          <p className="text-red-600 mt-4 text-sm">
            You must be verified by admin to create quizzes.
          </p>
        )}
      </div>
    </div>
  );
}
