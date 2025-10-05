import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

export const baseURL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api";

const axiosInstance = axios.create({
    baseURL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");

        console.log("AXIOS INTERCEPTOR: Attaching token:", token);

        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Something went wrong, please try again.";
        return Promise.reject(message);
    }
);

export default axiosInstance;
