import axiosInstance from "../utils/axiosInstance";

export const agentKeyAPI = {
  getAgentKeys: async () => {
    try {
      const response = await axiosInstance.get("/agent-keys");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching agent keys" };
    }
  },
  
  updateAgentKeys: async (data) => {
    try {
      const response = await axiosInstance.post("/agent-keys", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error updating agent keys" };
    }
  }
};
