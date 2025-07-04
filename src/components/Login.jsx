import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Fill all fields");

    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created 🎉");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in 🚀");
      }
      navigate("/");
    } catch (err) {
      toast.error(err.message.split(":").pop().trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18181b] px-4 py-12 text-white">
      <div className="w-full max-w-3xl rounded-3xl shadow-[0_0_25px_#0f0f0f] overflow-hidden backdrop-blur-2xl bg-white/5 border border-white/10 transition-all duration-500 flex flex-col-reverse md:flex-row">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 px-8 py-12">
          <h2 className="text-3xl font-bold mb-2 tracking-tight text-blue-500">
            {isSignup ? "Create Account" : "Welcome Back 👋"}
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            {isSignup
              ? "Join Notopia and start saving your brilliant ideas."
              : "Login to access your notes."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-[#1e1e1e] border border-gray-700 px-4 py-3 rounded-md focus:outline-none placeholder-gray-400 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter password"
              className="w-full bg-[#1e1e1e] border border-gray-700 px-4 py-3 rounded-md focus:outline-none placeholder-gray-400 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 rounded-md transition-all shadow-md"
            >
              {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-gray-400">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-400 hover:underline"
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>

        {/* Right Side - Aesthetic Panel (Now visible on all devices) */}
        <div className="w-full md:w-1/2 flex items-center justify-center relative bg-gradient-to-br from-[#101010] to-[#1e1e1e] p-10 md:p-12">
          <div className="text-left text-white space-y-4">
            <h3 className="text-2xl font-semibold">
              {isSignup ? "📌 Secure your notes" : "✨ Welcome to Notopia"}
            </h3>
            <p className="text-sm text-gray-400">
              {isSignup
                ? "Start your creative journey. Sign up to store your ideas in the cloud."
                : "Your world of organized, searchable, and shareable notes."}
            </p>
          </div>
          <div className="absolute bottom-6 right-6 text-xs text-gray-600 opacity-50 hidden md:block">
            {isSignup ? "Let's get you started" : "Ready to make magic?"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
