import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const contactMessageAPI = {
  getAllMessages: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.CONTACT_MESSAGES.BASE);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching contact messages" };
    }
  },

  updateDescription: async (phone, description) => {
    try {
      const url = ENDPOINTS.CONTACT_MESSAGES.UPDATE_DESCRIPTION.replace(":phone", phone);
      const response = await axiosInstance.patch(url, { description });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error updating description" };
    }
  },

  deleteMessage: async (id) => {
    try {
      const url = `${ENDPOINTS.CONTACT_MESSAGES.BASE}/${id}`;
      const response = await axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error deleting message" };
    }
  }
};
