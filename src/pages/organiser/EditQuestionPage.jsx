import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function EditQuestionPage() {
  const { quizId, questionId } = useParams();
  const navigate = useNavigate();

  const [questionData, setQuestionData] = useState({
    question: "",
    type: "MCQ",
    answer: "",
    options: ["", "", "", ""],
  });

  const [loading, setLoading] = useState(true);

  const fetchQuestion = async () => {
    try {
      const docRef = doc(db, "quizzes", quizId, "questions", questionId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setQuestionData({
          question: data.question || "",
          type: data.type || "MCQ",
          answer: data.answer || "",
          options: data.options || ["", "", "", ""],
        });
      } else {
        console.error("Question not found!");
      }
    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [quizId, questionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionData.options];
    newOptions[index] = value;
    setQuestionData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, "quizzes", quizId, "questions", questionId);
      const updateData = {
        question: questionData.question,
        type: questionData.type,
        answer: questionData.answer,
      };
      if (questionData.type === "MCQ") {
        updateData.options = questionData.options;
      }
      await updateDoc(docRef, updateData);
      alert("Question updated successfully!");
      navigate(`/organiser/questions/${quizId}`);
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading question...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">✏️ Edit Question</h1>

        {/* Question Text */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
        <textarea
          name="question"
          value={questionData.question}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
          placeholder="Enter your question..."
        />

        {/* Question Type */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
        <select
          name="type"
          value={questionData.type}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
        >
          <option value="MCQ">MCQ</option>
          <option value="FILL_BLANK">Fill in the Blank</option>
        </select>

        {/* Options (for MCQ only) */}
        {questionData.type === "MCQ" && (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            {questionData.options.map((opt, idx) => (
              <input
                key={idx}
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="w-full border border-gray-300 rounded-lg p-3 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
              />
            ))}
          </>
        )}

        {/* Answer */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correct Answer {questionData.type === "MCQ" && "(must match an option)"}
        </label>
        <input
          type="text"
          name="answer"
          value={questionData.answer}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6"
          placeholder="Enter correct answer..."
        />

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/organiser/questions/${quizId}`)}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition"
          >
            Save Changes ✅
          </button>
        </div>
      </div>
    </div>
  );
}
