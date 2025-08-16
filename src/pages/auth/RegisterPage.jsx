import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { registerWithEmail, signInWithGoogle } from "../../firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { FaGoogle } from "react-icons/fa";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // store quizId from URL if user came via quiz link
  useEffect(() => {
    const pathParts = location.pathname.split("/"); // ["", "quiz", "4xlFUEEmZCNr8vTv3B5E"]
    const quizIdFromPath = pathParts[2] || null;
    if (quizIdFromPath) {
      sessionStorage.setItem("quizIdFromLink", quizIdFromPath);
    }
  }, [location.pathname]);

  const quizIdFromLink = sessionStorage.getItem("quizIdFromLink") || null;

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const redirectAfterRegister = (role, uid) => {
    localStorage.setItem("user", JSON.stringify({ uid, role }));

    if (quizIdFromLink && role === "user") {
      sessionStorage.removeItem("quizIdFromLink"); // Clear after redirect
      navigate(`/participant/guidelines/${quizIdFromLink}`);
    } else if (role === "organiser") {
      navigate("/organiser/dashboard");
    } else {
      navigate("/participant/active-quizzes");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      const userCred = await registerWithEmail(formData.email, formData.password);

      await setDoc(doc(db, "users", userCred.user.uid), {
        email: formData.email,
        role: formData.role,
        createdAt: new Date(),
        verified: false,
        admin: false,
      });

      redirectAfterRegister(formData.role, userCred.user.uid);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      const userCred = await signInWithGoogle();

      await setDoc(doc(db, "users", userCred.user.uid), {
        email: userCred.user.email,
        role: "user",
        createdAt: new Date(),
      });

      redirectAfterRegister("user", userCred.user.uid);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all hover:scale-[1.02] duration-300">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 mb-6">
          Create an Account
        </h1>

        {error && (
          <div className="bg-red-200 text-red-900 font-medium p-3 rounded-lg mb-4 shadow">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="border border-gray-300 text-black rounded-xl p-3 w-full focus:ring-4 focus:ring-pink-300 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border border-gray-300 text-black rounded-xl p-3 w-full focus:ring-4 focus:ring-pink-300 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="border border-gray-300 text-black rounded-xl p-3 w-full focus:ring-4 focus:ring-pink-300 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Select Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border border-gray-300 text-black rounded-xl p-3 w-full focus:ring-4 focus:ring-pink-300 outline-none"
            >
              <option value="user">User</option>
              <option value="organiser">Organiser</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-pink-500 hover:to-indigo-500 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500">OR</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300"
        >
          <FaGoogle className="text-white text-lg" />
          <span>Sign Up with Google</span>
        </button>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 hover:underline font-bold"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
