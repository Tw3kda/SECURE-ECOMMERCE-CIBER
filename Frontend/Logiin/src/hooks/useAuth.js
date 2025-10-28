import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(() => {
    return localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;
  });

  const login = (username) => {
    const newUser = { name: username };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return { user, login, logout };
}
