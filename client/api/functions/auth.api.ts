import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endPoints/authEndpoints";
import { 
  RegisterPayload, 
  LoginPayload, 
  AuthResponse, 
  DevRequestPayload, 
  DevRequestResponse, 
  DevRegisterPayload, 
  DevRegisterResponse 
} from "@/typescript/authTypes";

// ===== User Auth =====
export const registerUser = async (data: RegisterPayload): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>(endpoints.auth.register, data);
  return res.data;
};

export const verifyEmail = async (token: string): Promise<AuthResponse> => {
  const res = await axiosInstance.get<AuthResponse>(`${endpoints.auth.verifyEmail}?token=${token}`);
  return res.data;
};

export const loginUser = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>(endpoints.auth.login, data);
  return res.data;
};

export const logoutUser = async (): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>(endpoints.auth.logout);
  return res.data;
};

export const resendVerificationMail = async (email: string): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>(endpoints.auth.resendVerificationMail, { email });
  return res.data;
};

export const forgotPassword = async (email: string): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>(endpoints.auth.forgotPassword, { email });
  return res.data;
};

export const resetPassword = async (token: string, password: string, confirmPassword: string): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>(
    `${endpoints.auth.resetPassword}?token=${token}`,
    { password, confirmPassword }
  );
  return res.data;
};

// ===== Developer Endpoints =====

// Developer requests a dev registration link
export const requestDevLink = async (data: DevRequestPayload): Promise<DevRequestResponse> => {
  const res = await axiosInstance.post<DevRequestResponse>(endpoints.auth.requestDevLink, data);
  return res.data;
};

// Developer completes registration using token
export const registerDev = async (token: string, data: DevRegisterPayload): Promise<DevRegisterResponse> => {
  const res = await axiosInstance.post<DevRegisterResponse>(
    `${endpoints.auth.registerDev}?token=${token}`,
    data
  );
  return res.data;
};
