import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate, useParams } from "react-router-dom";

export default function EditQuizPage() {
  const { quizId } = useParams();
  const [title, setTitle] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [accessType, setAccessType] = useState("open"); // default open
  const [linkCode, setLinkCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [originalCollection, setOriginalCollection] = useState("quizzes"); // track where quiz is
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const snap = await getDoc(doc(db, "quizzes", quizId));
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title || "");
          setGuidelines(data.guidelines || "");
          setAccessType("open");
          setLinkCode("");
          setOriginalCollection("quizzes");
        } else {
          const linkSnap = await getDoc(doc(db, "quizzes_links", quizId));
          if (linkSnap.exists()) {
            const data = linkSnap.data();
            setTitle(data.title || "");
            setGuidelines(data.guidelines || "");
            setAccessType("link-only");
            setLinkCode(data.linkCode || "");
            setOriginalCollection("quizzes_links");
          } else {
            alert("Quiz not found!");
            navigate("/organiser/dashboard");
          }
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, navigate]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      alert("Quiz title is required!");
      return;
    }

    try {
      const targetCollection = accessType === "open" ? "quizzes" : "quizzes_links";

      const updatedData = {
        title,
        guidelines,
        accessType,
        linkCode: accessType === "link-only" ? linkCode.toUpperCase() : "",
      };

      if (originalCollection === targetCollection) {
        await updateDoc(doc(db, targetCollection, quizId), updatedData);
      } else {
        await setDoc(doc(db, targetCollection, quizId), updatedData);
        await deleteDoc(doc(db, originalCollection, quizId));
        setOriginalCollection(targetCollection);
      }

      alert("Quiz updated successfully!");
      navigate("/organiser/dashboard");
    } catch (error) {
      console.error("Error updating quiz:", error);
      alert("Failed to update quiz!");
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
          className="w-full border border-gray-300 rounded-lg p-3 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
        />

        {/* Access Type - Read Only */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Access</label>
        <input
          type="text"
          value={accessType === "open" ? "Open to all" : "Only via link"}
          readOnly
          className="w-full border border-gray-300 rounded-lg p-3 text-black bg-gray-100 cursor-not-allowed mb-4"
        />

        {accessType === "link-only" && (
          <div className="flex flex-col gap-2 mb-4">
            <input
              type="text"
              value={linkCode}
              readOnly
              className="border border-gray-300 rounded-lg p-3 w-full text-black bg-gray-100 cursor-not-allowed"
            />
          </div>
        )}

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
