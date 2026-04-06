"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "@/api/auth";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ["/", "/register", "/forget-password", "/reset-password"];

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setUser(null);
      setLoading(false);
      // Redirect to root if not using a public route
      if (!publicRoutes.includes(pathname)) {
        router.push("/");
      }
      return;
    }

    try {
      const data = await authAPI.Me();
      if (data?.success) {
        setUser(data.user);
        // If logged in and on a public route, redirect to dashboard
        if (publicRoutes.includes(pathname)) {
          router.push("/dashboard");
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setUser(null);
        if (!publicRoutes.includes(pathname)) {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setUser(null);
      if (!publicRoutes.includes(pathname)) {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }

  };



  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-check on navigation

  const login = async (credentials) => {
    const data = await authAPI.login(credentials);
    if (data?.success) {
      setUser(data.user);
      router.push("/dashboard");
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
