// src/components/ScoreBoard.jsx
export default function ScoreBoard({ scores }) {
  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr className="bg-gray-200">
          <th className="border p-2">Rank</th>
          <th className="border p-2">User</th>
          <th className="border p-2">Score</th>
          <th className="border p-2">Time Taken</th>
        </tr>
      </thead>
      <tbody>
        {scores.map((s, i) => (
          <tr key={s.id}>
            <td className="border p-2">{i + 1}</td>
            <td className="border p-2">{s.userEmail}</td>
            <td className="border p-2">{s.score}</td>
            <td className="border p-2">{s.timeTaken}s</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
