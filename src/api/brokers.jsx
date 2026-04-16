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

  updateBroker: async (id, brokerData) => {
    try {
      const response = await axiosInstance.put(`${ENDPOINTS.BROKERS.CREATE}/${id}`, brokerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error updating broker" };
    }
  },

  deleteBroker: async (id) => {
    try {
      const response = await axiosInstance.delete(`${ENDPOINTS.BROKERS.CREATE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error deleting broker" };
    }
  },

  getBrokersNames: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.BROKERS.GET_NAMES);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching brokers names" };
    }
  },

  getCommissionStats: async (brokerId) => {
    try {
      const response = await axiosInstance.get(`${ENDPOINTS.BROKERS.CREATE}/${brokerId}/commission-stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching commission stats" };
    }
  },

  recordCommissionPayment: async (brokerId, propertyNumber, paymentData) => {
    try {
      const response = await axiosInstance.post(`${ENDPOINTS.BROKERS.CREATE}/${brokerId}/${propertyNumber}/record-payment`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error recording commission payment" };
    }
  }
};
