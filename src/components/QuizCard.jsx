// src/components/QuizCard.jsx
export default function QuizCard({ quiz, onClick }) {
  return (
    <div
      onClick={onClick}
      className="border rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition"
    >
      <h3 className="text-lg font-semibold">{quiz.title}</h3>
      <p className="text-gray-500">{quiz.description}</p>
      <p className="text-sm mt-2">Active: {quiz.active ? "Yes" : "No"}</p>
    </div>
  );
}
