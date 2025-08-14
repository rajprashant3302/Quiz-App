// src/pages/auth/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerWithEmail, signInWithGoogle } from "../../firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { FaGoogle } from "react-icons/fa";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // default role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    if(!formData.role)
    {
      return setError("Role not selected !");
    }

    setLoading(true);
    try {
      const userCred = await registerWithEmail(formData.email, formData.password);

      // Save role in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        email: formData.email,
        role: formData.role,
        createdAt: new Date(),
        verified : false,
        admin:false
      });

      // Redirect based on role
      if (formData.role === "organiser") {
        navigate("/organiser/dashboard");
      } else {
        navigate("/participant/active-quizzes");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const userCred = await signInWithGoogle();

      // Save role in Firestore (default user)
      await setDoc(doc(db, "users", userCred.user.uid), {
        email: userCred.user.email,
        role: "user",
        createdAt: new Date()
      });

      navigate("/participant/active-quizzes");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create an Account
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="border border-gray-300 text-black rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border border-gray-300 text-black rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="border border-gray-300 text-black rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Select Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border border-gray-300 text-black rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-400 outline-none"
            >
              <option value="user">User</option>
              <option value="organiser">Organiser</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow transition duration-200 disabled:opacity-50"
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
          className="w-full bg-red-500 flex items-center justify-center gap-2 hover:bg-red-600 text-white font-semibold py-3 rounded-lg shadow transition duration-200"
        ><FaGoogle />
         <span>Sign Up with Google</span> 
        </button>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
