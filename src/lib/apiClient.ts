import { useAuth } from "@/hooks/useAuth";
import { API_URL } from "./constants";
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { accessTokenToUser } from "./authService";

export async function refreshAuthToken() {
	const userId = useAuth.getState().user?.userId;
	const logout = useAuth.getState().logout;
	if (!userId) throw new AxiosError("No userId", "401");

	try {
		const response = await axios.post(
			`${API_URL}/auth/refresh-token`,
			{
				user_id: userId,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
				withCredentials: true,
			},
		);

		const newToken: string | undefined = response.data.access_token;
		if (!newToken) throw new AxiosError("No new token", "401");
		return {
			accessToken: newToken,
		};
	} catch (e) {
		console.error("Refresh token failed:", e);
		logout();
		throw e;
	}
}

// export async function localFetch<T>(url: string, options?: RequestInit) {
//   const token = useAuth.getState().user?.token;
//
//   const fUrl = API_URL;
//
//   const res = await fetch(`${fUrl}${url}`, {
//     ...options,
//     headers: {
//       ...options?.headers,
//       Authorization: token ? `Bearer ${token}` : "",
//     },
//   });
//
//   if (!res.ok) {
//     throw new Error(res.statusText);
//   }
//
//   try {
//     return (await res.json()) as T;
//   } catch (e) {
//     return res as T;
//   }
// }

const axiosClient = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

axiosClient.interceptors.request.use(
	(config) => {
		if (config.baseURL !== API_URL) {
			return config;
		}

		const user = useAuth.getState().user;
		if (user) {
			config.headers.Authorization = `Bearer ${user.token}`;
		}

		return config;
	},
	async (error: AxiosError) => {
		return Promise.reject(error);
	},
);

axiosClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as AxiosRequestConfig & {
			_retry?: boolean;
		};
		const isTokenExpiredError =
			error.request?.status === 401 && !originalRequest._retry;

		if (!isTokenExpiredError) return Promise.reject(error);

		originalRequest._retry = true;
		const setUser = useAuth.getState().setUser;
		const logout = useAuth.getState().logout;
		try {
			const { accessToken } = await refreshAuthToken();
			const user = accessTokenToUser(accessToken);
			setUser(user);
			return axiosClient(originalRequest);
		} catch (e) {
			console.error("Failed to refresh token, logging out:", e);
			await logout();
			return Promise.reject(e);
		}
	},
);

export default axiosClient;
