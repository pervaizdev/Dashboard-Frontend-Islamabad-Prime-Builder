export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/signup",
    ME: "/auth/me",
    FORGETPASSWORD: "/auth/forgot-password",
    VERIFYCODE: "/auth/verify-code", // Note: Backend didn't have this, but keeping it as placeholder if needed
    RESETPASSWORD: "/auth/reset-password",
    REFRESH_TOKEN: "/auth/refresh-token",
  },
  DASHBOARD: {
    USER: "/dashboard/user",
    ADMIN: "/dashboard/admin",
  },
  NOTIFICATIONS: {
    GET_INSTALLMENT_NOTIFICATIONS: "/property-details/installment-notifications",
  },
  PROPERTIES: {
    GET_MY_PROPERTIES: "/property-details/my-property",
    GET_DUE_INSTALLMENTS: "/property-details/due-installments",
  },
};




