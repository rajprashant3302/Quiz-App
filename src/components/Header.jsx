// src/components/Header.jsx
import { Link } from "react-router-dom";
import { logoutUser } from "../firebase/auth";

export default function Header({ user }) {
  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">Quiz App</Link>
      <nav className="space-x-4">
        {user ? (
          <>
            <span>{user.email}</span>
            <button
              onClick={logoutUser}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="ml-3">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
