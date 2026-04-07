import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const brokersAPI = {
  createBroker: async (brokerData) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.BROKERS.CREATE, brokerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error creating broker" };
    }
  },

  getAllBrokers: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.BROKERS.CREATE);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching brokers" };
    }
  },

  getBrokersNames: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.BROKERS.GET_NAMES);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching brokers names" };
    }
  }
};
