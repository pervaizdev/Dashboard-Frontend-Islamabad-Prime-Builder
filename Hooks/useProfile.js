"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeApi } from "@/Api/auth.js";

const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);

      const response = await getMeApi();
      const { data } = response;

      setProfile(data.user);

    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
  };
};

export default useProfile;