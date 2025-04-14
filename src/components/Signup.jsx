import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../App.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(`Signup failed: ${error.message}`);
    } else {
      setMessage("Signup successful! Please check your email to confirm.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Sign Up</h2>
        <input
          type="email"
          placeholder="Your email"
          className="border p-2 w-full mb-4"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Create password"
          className="border p-2 w-full mb-4"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          className="border p-2 w-full mb-4"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Sign Up
        </button>
        {message && (
          <p className="mt-3 text-sm text-center text-red-600">{message}</p>
        )}
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/" className="text-blue-500 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
