"use client";

import { useContext } from "react";
import { AuthContext } from "@/Context Api/AuthContext.jsx";

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;