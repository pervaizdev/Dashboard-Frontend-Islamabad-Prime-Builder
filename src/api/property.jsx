import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const propertyAPI = {
  getMyProperties: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PROPERTIES.GET_MY_PROPERTIES);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching my properties" };
    }
  },

  getDueInstallments: async (params) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PROPERTIES.GET_DUE_INSTALLMENTS, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching due installments" };
    }
  },
};

