import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { AUTHORIZED_USERS } from "./authorizedUsers";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!AUTHORIZED_USERS.includes(normalizedEmail)) {
      setError("You are not authorized to upload notes.");
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      onLogin(result.user);
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogin(null);
  };

  return (
    <div className="login-box">
      <h2>Authorized Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Login
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}