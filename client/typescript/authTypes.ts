export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  userName?: string;          
  email: string;
  role: string;
  avatarUrl?: string;
  profile?: {
    profilePic?: string;     
    firstNameDisplay?: string; 
    lastNameDisplay?: string;
  };
}


export interface AuthResponse {
  status: boolean;
  message: string;
  user?: User;
  token?: string;
  firstTime?: boolean;
}

export interface VerifyEmailResponse {
  status: boolean;
  message: string;
  user?: User;
  token?: string;
  firstTime?: boolean;
}

// ===== New Developer Types =====
export interface DevRequestPayload {
  firstName: string;
  lastName: string;
  email: string;
}

export interface DevRequestResponse {
  status: boolean;
  message: string;
}

export interface DevRegisterPayload {
  userName: string;
  password: string;
}

export interface DevRegisterResponse extends AuthResponse {}
