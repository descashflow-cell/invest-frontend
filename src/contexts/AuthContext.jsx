import { createContext, useContext, useEffect, useState } from "react";
import { authMe, authLogin, authRegister } from "@/lib/api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const t = localStorage.getItem("cf_token");
    if (!t) { setUser(null); return; }
    authMe().then(setUser).catch(() => { localStorage.removeItem("cf_token"); setUser(null); });
  }, []);

  const login = async (email, password) => {
    const { token, user } = await authLogin({ email, password });
    localStorage.setItem("cf_token", token); setUser(user);
  };
  const register = async (email, password, name) => {
    const { token, user } = await authRegister({ email, password, name });
    localStorage.setItem("cf_token", token); setUser(user);
  };
  const logout = () => { localStorage.removeItem("cf_token"); setUser(null); window.location.href = "/login"; };

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
