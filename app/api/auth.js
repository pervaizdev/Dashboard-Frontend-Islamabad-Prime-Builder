import axiosInstance from "@/app/utils/axios/axiosInstance";
import { AUTH_ENDPOINTS } from "../endpoints";

export const loginUserApi = async (payload) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, payload);
  return response;
};

export const getMeApi = async () => {
  const response = await axiosInstance.get(AUTH_ENDPOINTS.ME);
  return response;
};

export const forgotPasswordApi = async (payload) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, payload);
  return response;
};

export const resetPasswordApi = async (payload) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.RESET_PASSWORD, payload);
  return response;
};