import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useMyProfileQuery } from "./profile.hooks.query"; // Import your existing profile query
import { forgotPassword, loginUser, logoutUser, registerDev, registerUser, requestDevLink, resendVerificationMail, resetPassword, verifyEmail } from "@/api/functions/auth.api";
import { DevRegisterPayload, DevRequestPayload, LoginPayload, RegisterPayload, ResetPasswordPayload } from "@/typescript/authTypes";
import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endPoints/authEndpoints";
import { AxiosError } from "axios";

// This is the new, simpler, and more powerful useAuth hook
export const useAuth = () => {
  const queryClient = useQueryClient();
  const [cookies, setCookie, removeCookie] = useCookies(["token", "user"]);

  // Get the user data directly from the central profile query's cache
  const { data: user, isLoading, isError } = useMyProfileQuery({
    enabled: !!cookies.token, // Only fetch the profile if a token exists
  });

  const {
    mutateAsync: handleLogin,
    isPending: isLoginLoading,
    error: loginError
  } = useMutation({
    mutationFn: (credentials: LoginPayload) => loginUser(credentials),
    onSuccess: (data) => {
      // On successful login, set the token cookie
      const { token } = data;
      setCookie("token", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      // Invalidate the profile query to force a refetch with the new token
      queryClient.invalidateQueries({ queryKey: ['MY_PROFILE'] });
      toast.success("Login successful!");
      return data;
    },
    onError: (message: string) => {
      toast.error(message);
    },
  });

  const {
    mutateAsync: handleRegister,
    isPending: isRegisterLoading,
    error: registerError
  } = useMutation({
    mutationFn: (credentials: RegisterPayload) => registerUser(credentials),
    onSuccess: (data) => {
      toast.success(data.message || "Registration successful! Please check your email to verify.");
    },
    onError: (error: any) => {
      let message = "Registration failed. Please try again.";

      if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      else if (typeof error.message === 'string') {
        message = error.message;
      }
      toast.error(message);
    },
  });

  const {
    mutateAsync: handleRegisterDev,
    isPending: isRegisteringDev,
  } = useMutation({
    mutationFn: (payload: { token: string, data: DevRegisterPayload }) =>
      registerDev(payload.token, payload.data),
    onSuccess: (data) => {
      const { token } = data;
      setCookie("token", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      queryClient.invalidateQueries({ queryKey: ['MY_PROFILE'] });
      toast.success("Developer registration successful!");
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Developer registration failed.");
      }
    },
  });

  const {
    mutateAsync: handleVerifyEmail,
    isPending: isVerifyingEmail,
    isSuccess: isVerificationSuccess,
    isError: isVerificationError,
    error: verificationError,
  } = useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    // No toast messages needed here, the page will display the status
  });

  const { mutateAsync: handleForgotPassword, isPending: isForgotPasswordLoading } = useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: (data) => {
      toast.success(data.message || "If an account exists, a reset link has been sent.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Request failed.");
    },
  });

  const { mutateAsync: handleResetPassword, isPending: isResetPasswordLoading } = useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload.token, payload.password, payload.confirmPassword),
    onSuccess: (data) => {
      toast.success(data.message || "Password has been reset successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Password reset failed.");
    },
  });

  const { mutateAsync: handleResendVerification, isPending: isResendLoading } = useMutation({
    mutationFn: (email: string) => resendVerificationMail(email),
    onSuccess: (data) => {
      toast.success(data.message || "Verification email sent. Please check your inbox.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Request failed.");
    },
  });

  const {
    mutateAsync: handleRequestDevLink,
    isPending: isRequestingDevLink
  } = useMutation({
    mutationFn: (payload: DevRequestPayload) => requestDevLink(payload),
    onError: (error: any) => {
      console.error("Server Response:", error.response?.data);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to submit request.");
      }
    },
  });

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Server logout failed, logging out locally.", error);
    } finally {
      queryClient.setQueryData(['MY_PROFILE'], null);
      removeCookie("token", { path: "/" });
      removeCookie("user", { path: "/" });
      queryClient.clear();
      toast.success("Logged out successfully!");
    }
  };


  return {
    user: user || null,
    isLoading,
    isError,
    isLoggedIn: !!user,
    handleLogout,
    handleLogin,
    isLoginLoading,
    loginError,
    handleRegister,
    loading: isRegisterLoading,
    handleRegisterDev,
    isRegisteringDev,
    handleVerifyEmail,
    isVerifyingEmail,
    isVerificationSuccess,
    isVerificationError,
    verificationError,
    handleForgotPassword,
    isForgotPasswordLoading,
    handleResetPassword,
    isResetPasswordLoading,
    handleResendVerification,
    isResendLoading,
    error: registerError,
    handleRequestDevLink,
    isRequestingDevLink,
    cookies
  };
};