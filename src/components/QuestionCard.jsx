// src/components/QuestionCard.jsx
export default function QuestionCard({ question, index, onChange }) {
  return (
    <div className="border rounded-lg p-4 shadow mb-4">
      <h4 className="font-semibold mb-2">{`Q${index + 1}: ${question.question}`}</h4>
      {question.type === "MCQ" ? (
        question.options.map((opt, i) => (
          <label key={i} className="block mb-2">
            <input
              type="radio"
              name={`q-${index}`}
              value={opt}
              onChange={(e) => onChange(index, e.target.value)}
              className="mr-2"
            />
            {opt}
          </label>
        ))
      ) : (
        <input
          type="text"
          onChange={(e) => onChange(index, e.target.value)}
          className="border p-2 w-full"
          placeholder="Type your answer..."
        />
      )}
    </div>
  );
}
