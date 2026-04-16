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

  getPropertyDetails: async (id) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PROPERTIES.GET_PROPERTY_DETAILS.replace(":id", id));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching property details" };
    }
  },

  updateInstallmentStatus: async (id, index, data) => {
    try {
      const url = ENDPOINTS.PROPERTIES.UPDATE_INSTALLMENT_STATUS
        .replace(":id", id)
        .replace(":index", index);
      const response = await axiosInstance.patch(url, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error updating installment status" };
    }
  },

  getAllProperties: async (params) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PROPERTIES.GET_ALL, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching all properties" };
    }
  },

  getFilteredProperties: async (params) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PROPERTIES.GET_FILTERED, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching filtered properties" };
    }
  },
  
  transferProperty: async (id, data) => {
    try {
      const response = await axiosInstance.post(`${ENDPOINTS.PROPERTIES.GET_ALL}/${id}/transfer`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error transferring property" };
    }
  },
};
