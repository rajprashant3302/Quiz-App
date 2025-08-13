// src/components/Timer.jsx
import { useEffect, useState } from "react";

export default function Timer({ duration, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <div className="text-lg font-bold text-red-600">
      Time Left: {timeLeft}s
    </div>
  );
}
