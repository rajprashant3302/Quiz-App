import { useEffect, useState } from "react";
import { doc, collection, addDoc, getDocs, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useParams, useNavigate } from "react-router-dom";

export default function QuestionsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [type, setType] = useState("MCQ");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [isLinkQuiz, setIsLinkQuiz] = useState(false); // new state to track quiz type
  const [quizData, setQuizData] = useState(null);

  // Determine if quiz is open or link-only
  const fetchQuizData = async () => {
    let quizRef = doc(db, "quizzes", quizId);
    let snap = await getDoc(quizRef);

    if (!snap.exists()) {
      // check link-only collection
      quizRef = doc(db, "quizzes_links", quizId);
      snap = await getDoc(quizRef);
      if (snap.exists()) {
        setIsLinkQuiz(true);
        setQuizData(snap.data());
      } else {
        alert("Quiz not found!");
        navigate("/organiser/dashboard");
        return;
      }
    } else {
      setQuizData(snap.data());
    }

    // fetch existing questions
    const qSnap = await getDocs(collection(db, isLinkQuiz ? "quizzes_links" : "quizzes", quizId, "questions"));
    setQuestions(qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse());
  };

  const addQuestion = async () => {
    if (!question.trim() || !answer.trim()) return alert("Please fill all fields!");
    const collectionName = isLinkQuiz ? "quizzes_links" : "quizzes";

    await addDoc(collection(db, collectionName, quizId, "questions"), {
      question,
      type,
      options: type === "MCQ" ? options : [],
      answer
    });
    setQuestion("");
    setOptions(["", "", "", ""]);
    setAnswer("");
    fetchQuizData();
  };

  const removeQuestion = async (qid) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    const collectionName = isLinkQuiz ? "quizzes_links" : "quizzes";
    await deleteDoc(doc(db, collectionName, quizId, "questions", qid));
    fetchQuizData();
  };

  useEffect(() => {
    fetchQuizData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Questions</h1>
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          onClick={() => navigate("/organiser/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Add Question Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Question</h2>

        <input
          placeholder="Enter question text..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border border-gray-300 text-black p-2 w-full rounded mb-3"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-300 text-black p-2 w-full rounded mb-3"
        >
          <option value="MCQ">Multiple Choice</option>
          <option value="FILL_BLANK">Fill in the Blank</option>
        </select>

        {type === "MCQ" && options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => {
              const newOpts = [...options];
              newOpts[i] = e.target.value;
              setOptions(newOpts);
            }}
            className="border border-gray-300 text-black p-2 w-full rounded mb-3"
          />
        ))}

        <input
          placeholder="Enter correct answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="border border-gray-300 text-black p-2 w-full rounded mb-4"
        />

        <button
          onClick={addQuestion}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full"
        >
          ➕ Add Question
        </button>
      </div>

      {/* Questions List */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Existing Questions ({questions.length})
        </h2>

        {questions.length === 0 ? (
          <p className="text-gray-500 italic">No questions added yet.</p>
        ) : (
          <ul className="space-y-4">
            {questions.map(q => (
              <li
                key={q.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">
                    {q.question} <span className="text-sm text-gray-500">({q.type})</span>
                  </span>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>

                {q.type === "MCQ" && (
                  <ul className="ml-4 mt-2 list-disc text-gray-700">
                    {q.options.map((opt, idx) => (
                      <li key={idx} className={opt === q.answer ? "font-bold text-green-600" : ""}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}

                {q.type === "FILL_BLANK" && (
                  <p className="mt-2 text-gray-700">
                    <span className="font-semibold">Answer:</span> {q.answer}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
