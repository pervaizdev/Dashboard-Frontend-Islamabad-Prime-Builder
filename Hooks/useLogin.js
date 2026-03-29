"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { loginUserApi } from "@/Api/auth";
import useAuth from "./useAuth";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (formData) => {
    try {
      setLoading(true);

      const response = await loginUserApi(formData);
      const { data, status } = response;

      login(data);

      toast.success(`${data.message}`);

      return data;
    } catch (error) {
      const status = error?.response?.status;
      const responseData = error?.response?.data;

      const validationMessage =
        responseData?.errors?.[0]?.message;

      const message =
        validationMessage ||
        responseData?.message ||
        "Something went wrong";

      if (status) {
        toast.error(`${message}`);
      } else {
        toast.error(message);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    loading,
  };
};

export default useLogin;