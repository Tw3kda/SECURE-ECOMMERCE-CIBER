import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!passwordRegex.test(form.password)) {
      setMessage(
        "❌ Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (response.ok) {
        setMessage(
          "✅ Registration successful! Wait for and admin to approve your SignUp."
        );
      } else {
        const err = await response.text();
        setMessage(`❌ Error: ${err || "Registration failed"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Network error. Check connection or SSL settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Create Account</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Registering..." : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            ...styles.button,
            background: "#6c757d",
            marginTop: "0.5rem",
          }}
        >
          Back to Home
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
  },
  form: {
    background: "white",
    padding: "2rem",
    borderRadius: "1rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  title: { textAlign: "center" },
  input: {
    padding: "0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.75rem",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
  },
  message: {
    textAlign: "center",
    marginTop: "1rem",
    color: "#333",
    fontSize: "0.9rem",
  },
};
