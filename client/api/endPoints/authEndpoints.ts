export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    googleAuth: "/auth/google",
    googleCallback: "/auth/google/callback",
    verifyEmail: "/auth/verify-email",
    resendVerificationMail: "/auth/resend-verification-mail",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    requestDevLink: "/auth/request-dev-link",
    registerDev: "/auth/register-dev",
  },
};

export const successNotificationEndpoints: string[] = [
  endpoints.auth.register,
  endpoints.auth.login,
  endpoints.auth.logout,
  endpoints.auth.verifyEmail,
  endpoints.auth.resendVerificationMail,
  endpoints.auth.forgotPassword,
  endpoints.auth.resetPassword,
  endpoints.auth.requestDevLink,
  endpoints.auth.registerDev,
];
