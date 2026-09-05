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

  getPropertyCommissionStats: async (queryParams = "") => {
    try {
      const url = queryParams 
        ? `${ENDPOINTS.DASHBOARD.PROPERTY_COMMISSION_STATS}?${queryParams}`
        : ENDPOINTS.DASHBOARD.PROPERTY_COMMISSION_STATS;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching property commission stats" };
    }
  },

  getPropertyCommissionReports: async (queryParams = "") => {
    try {
      const url = queryParams 
        ? `${ENDPOINTS.DASHBOARD.PROPERTY_COMMISSION_REPORTS}?${queryParams}`
        : ENDPOINTS.DASHBOARD.PROPERTY_COMMISSION_REPORTS;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching property commission reports" };
    }
  },

  getPropertyCommissionSuggestions: async (type, query) => {
    try {
      const response = await axiosInstance.get(`/dashboard/property-commission-suggestions?type=${type}&query=${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching suggestions" };
    }
  },
  
  getAllProperties: async () => {
    try {
      const response = await axiosInstance.get(`/dashboard/all-properties`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching all properties" };
    }
  }
};
