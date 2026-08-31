import axiosInstance from "../utils/axiosInstance";

export const chatAPI = {
  sendMessage: async (message, context, history) => {
    try {
      const response = await axiosInstance.post("/chat", { message, context, history });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error sending message" };
    }
  }
};
