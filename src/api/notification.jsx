import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const notificationAPI = {
  getInstallmentNotifications: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.NOTIFICATIONS.GET_INSTALLMENT_NOTIFICATIONS);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching notifications" };
    }
  },
};
