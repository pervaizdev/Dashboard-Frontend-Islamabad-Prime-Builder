import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const announcementAPI = {
  createAnnouncement: async (announcementData) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.BANNERS.BASE, announcementData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error creating announcement" };
    }
  },

  getAllAnnouncements: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.BANNERS.BASE);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching announcements" };
    }
  },

  getActiveAnnouncements: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.BANNERS.BASE);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching active announcements" };
    }
  },

  getAnnouncementById: async (id) => {
    try {
      const response = await axiosInstance.get(`${ENDPOINTS.BANNERS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching announcement details" };
    }
  },

  updateAnnouncement: async (id, announcementData) => {
    try {
      const response = await axiosInstance.put(`${ENDPOINTS.BANNERS.BASE}/${id}`, announcementData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error updating announcement" };
    }
  },

  deleteAnnouncement: async (id) => {
    try {
      const response = await axiosInstance.delete(`${ENDPOINTS.BANNERS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error deleting announcement" };
    }
  }
};
