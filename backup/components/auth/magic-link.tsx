"use client";
import { useState } from "react";

export default function MagicLink() {
  const [email, setEmail] = useState("");

  return (
    <div style={{maxWidth: 400, margin: "auto"}}>
      <h2>Sign in</h2>
      <input
        type="email"
        value={email}
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          border: "1px solid #ccc",
          borderRadius: 6,
        }}
      />
      <button style={{marginTop: 12, width: "100%"}}>
        Send Magic Link
      </button>
    </div>
  );
}
