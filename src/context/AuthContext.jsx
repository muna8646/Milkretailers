import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("milkcollect_user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const loginUser = (data) => {
    localStorage.setItem("milkcollect_token", data.token);
    localStorage.setItem("milkcollect_user", JSON.stringify(data.user));

    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("milkcollect_token");
    localStorage.removeItem("milkcollect_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}