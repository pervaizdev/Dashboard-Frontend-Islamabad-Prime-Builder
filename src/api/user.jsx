import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const userAPI = {
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.USERS.BASE);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching users" };
    }
  },

  updateUser: async (id, userData) => {
    try {
      const url = ENDPOINTS.USERS.UPDATE.replace(":id", id);
      const response = await axiosInstance.put(url, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error updating user" };
    }
  },

  deleteUser: async (id) => {
    try {
      const url = ENDPOINTS.USERS.UPDATE.replace(":id", id);
      const response = await axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error deleting user" };
    }
  }
};
