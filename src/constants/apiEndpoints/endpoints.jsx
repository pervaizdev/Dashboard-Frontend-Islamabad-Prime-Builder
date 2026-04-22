export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/signup",
    ME: "/auth/me",
    FORGETPASSWORD: "/auth/forgot-password",
    VERIFYCODE: "/auth/verify-otp",
    RESETPASSWORD: "/auth/reset-password",
    REFRESH_TOKEN: "/auth/refresh-token",
    UPDATE_PASSWORD: "/auth/update-password",
  },
  DASHBOARD: {
    USER: "/dashboard/user",
    ADMIN: "/dashboard/admin",
  },
  NOTIFICATIONS: {
    GET_INSTALLMENT_NOTIFICATIONS: "/property-details/installment-notifications",
  },
  PROPERTIES: {
    GET_ALL: "/property-details",
    GET_MY_PROPERTIES: "/property-details/my-property",
    GET_DUE_INSTALLMENTS: "/property-details/due-installments",
    GET_PROPERTY_DETAILS: "/property-details/:id",
    UPDATE_INSTALLMENT_STATUS: "/property-details/:id/installments/:index",
    GET_FILTERED: "/property-details/filtered",
  },
  BROKERS: {
    CREATE: "/brokers",
    GET_NAMES: "/brokers/names",
    GET_OVERALL_STATS: "/brokers/overall-stats",
    GET_REPORTS: "/brokers/reports",
  },
  BANNERS: {
    BASE: "/banners",
    ALL: "/banners/all",
  },
  USERS: {
    BASE: "/users",
    UPDATE: "/users/:id",
  },
  CONTACT_MESSAGES: {
    BASE: "/add-message",
    UPDATE_DESCRIPTION: "/add-message/phone/:phone/description",
  },
};
