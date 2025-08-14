// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import { loginWithEmail, signInWithGoogle, getUserRole } from "../../firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const redirectBasedOnRole = (role) => {
    if (role === "organiser") {
      navigate("/organiser/dashboard");
    } else {
      navigate("/participant/active-quizzes");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginWithEmail(formData.email, formData.password);
      if (!formData.role) {
        return setError("Select a Role !");
      }
      let role = await getUserRole(result.user.uid);
      if (role !== formData.role) {
        return setError("Invalid credentials!");
      }
      localStorage.setItem("user", JSON.stringify({ ...result.user, role }));
      redirectBasedOnRole(role);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInWithGoogle();
      let role = await getUserRole(result.user.uid);
      localStorage.setItem("user", JSON.stringify({ ...result.user, role }));
      redirectBasedOnRole(role);
    } catch (err) {
      setError(err.message || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all hover:scale-[1.02] duration-300">
        <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 mb-8">
          Welcome Back
        </h1>

        {error && (
          <div className="bg-red-200 text-red-900 font-medium p-3 rounded-lg mb-4 shadow">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
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
            <label className="block text-gray-700 font-semibold mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border border-gray-300 text-black rounded-xl p-3 w-full focus:ring-4 focus:ring-pink-300 outline-none"
            >
              <option value="">Select your role</option>
              <option value="user">User</option>
              <option value="organiser">Organiser</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-pink-500 hover:to-indigo-500 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500">OR</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300"
        >
          <FaGoogle className="text-white text-lg" />
          <span>Login with Google</span>
        </button>

        <p className="text-center text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 hover:underline font-bold"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
