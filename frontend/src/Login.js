import { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      alert("Login successful 🎉");
    } catch (err) {
      alert(err.response?.data?.msg || "Login error");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ✅ fixed */}
        <button onClick={login}>Login</button>
      </div>
    </div>
  );
}

export default Login;
