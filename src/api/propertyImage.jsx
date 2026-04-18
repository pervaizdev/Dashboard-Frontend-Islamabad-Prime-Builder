import axiosInstance from "../utils/axiosInstance";

export const getPropertyImages = async (folder) => {
  const response = await axiosInstance.get(`/property-image?folder=${encodeURIComponent(folder)}`);
  return response.data;
};

export const uploadPropertyImage = async (formData, folder, isLanding = false) => {
  const path = isLanding ? "landing" : "dashboard";
  const response = await axiosInstance.post(
    `/property-image/${path}?folder=${encodeURIComponent(folder)}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const updatePropertyImage = async (id, data) => {
  const response = await axiosInstance.put(`/property-image/${id}`, data);
  return response.data;
};

export const deletePropertyImage = async (id) => {
  const response = await axiosInstance.delete(`/property-image/${id}`);
  return response.data;
};
