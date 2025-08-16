import { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function CreateQuizPage() {
  const [title, setTitle] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessType, setAccessType] = useState("open");
  const [linkCode, setLinkCode] = useState("");
  const [generatedLink, setGeneratedLink] = useState(""); // for displaying final link
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

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

  // Generate random 6-character code
  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setLinkCode(code);
  };

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
      let docRef;
      if (accessType === "open") {
        docRef = await addDoc(collection(db, "quizzes"), {
          title: title.trim(),
          guidelines: guidelines.trim(),
          active: false,
          createdAt: serverTimestamp(),
          organiserId: auth.currentUser.uid,
        });
      } else {
        if (!linkCode.trim()) {
          alert("Please provide a code or generate one!");
          return;
        }
        docRef = await addDoc(collection(db, "quizzes_links"), {
          title: title.trim(),
          guidelines: guidelines.trim(),
          active: false,
          createdAt: serverTimestamp(),
          organiserId: auth.currentUser.uid,
          organiserName: auth.currentUser.displayName || "Anonymous",
          linkCode: linkCode.trim(),
        });
        setGeneratedLink(`${window.location.origin}/quiz/${linkCode.trim()}`);
      }

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

        <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
        <input
          className="border border-gray-300 rounded-lg p-3 w-full mb-4 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Enter quiz title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Guidelines (optional)</label>
        <textarea
          className="border border-gray-300 rounded-lg p-3 w-full mb-4 text-black h-28 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Add instructions or guidelines for participants..."
          value={guidelines}
          onChange={(e) => setGuidelines(e.target.value)}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Access</label>
        <select
          value={accessType}
          onChange={(e) => setAccessType(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 w-full mb-4 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="open">Open to all</option>
          <option value="link-only">Only via link</option>
        </select>

        {accessType === "link-only" && (
          <div className="flex flex-col gap-2 mb-4">
            <input
              className="border border-gray-300 rounded-lg p-3 w-full text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter code or generate one..."
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
            />
            <button
              onClick={generateCode}
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition w-full"
            >
              Generate Code
            </button>
          </div>
        )}

        {generatedLink && (
          <p className="text-blue-600 text-sm mb-4">
            Share this link: <a href={generatedLink} className="underline">{generatedLink}</a>
          </p>
        )}

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
