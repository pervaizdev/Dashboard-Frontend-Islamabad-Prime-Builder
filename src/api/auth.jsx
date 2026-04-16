import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const authAPI = {
  signUp: async (userData) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Signup failed" };
    }
  },

  login: async (credentials) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Save tokens from response
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  Me: async () => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.AUTH.ME,
      );
      return response.data; // Return the user data
    }
    catch (error) {
      throw error.response?.data || { message: "Error fetching user data" };
    }
  },

  forgotPassword: async (identifier) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.FORGETPASSWORD,
        { identifier }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Password reset request failed" };
    }
  },

  verifyOTP: async (phone, otp) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.VERIFYCODE, // mappings to /auth/verify-otp
        { phone, otp }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "OTP verification failed" };
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.RESETPASSWORD,
        { token, password }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Password reset failed" };
    }
  },

  updatePassword: async (password) => {
    try {
      const response = await axiosInstance.post(
        "/auth/update-password",
        { password }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Password update failed" };
    }
  },
};

