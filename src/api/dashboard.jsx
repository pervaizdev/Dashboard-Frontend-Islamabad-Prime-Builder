import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const dashboardAPI = {
  getUserSummary: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.DASHBOARD.USER);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching user dashboard summary" };
    }
  },

  getAdminSummary: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.DASHBOARD.ADMIN);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching admin dashboard summary" };
    }
  },
};
