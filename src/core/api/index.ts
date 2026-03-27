import { env } from "@/config/env";
import axios, { type AxiosInstance } from "axios";
import { useGlobalStore } from "@/core/global-store/index";
import type {
  TRefreshTokenResponse,
  TSigninInput,
  TSigninResponse,
  TSignupInput,
  TSignupResponse,
  TUser,
} from "../types";

const setUser = useGlobalStore.getState().setUser;

class BackendApi {
  private readonly api: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshQueue: Array<{
    resolve: (value: TRefreshTokenResponse) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor(url: string) {
    const accessToken = window.localStorage.getItem("accessToken") || "";
    axios.defaults.withCredentials = true;
    this.api = axios.create({
      baseURL: url,
      // this is commented out because we want to set the token dynamically
      // headers: {
      //   Authorization: `Bearer ${this.accessToken}`,
      // },
    });

    this.api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          originalRequest.url !== "/auth/refresh"
        ) {
          if (this.isRefreshing) {
            return new Promise<TRefreshTokenResponse>((resolve, reject) => {
              this.refreshQueue.push({ resolve, reject });
            })
              .then((tokens) => {
                originalRequest.headers["Authorization"] =
                  `Bearer ${tokens.accessToken}`;
                return this.api(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }
          this.isRefreshing = true;
          try {
            const token = window.localStorage.getItem("refreshToken");
            if (!token) {
              throw new Error("No refresh token available");
            }
            const { accessToken, refreshToken } = await this.refresh(token);
            window.localStorage.setItem("accessToken", accessToken);
            window.localStorage.setItem("refreshToken", refreshToken);
            this.api.defaults.headers.common["Authorization"] =
              `Bearer ${accessToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
            this.processRefreshQueue(null, { accessToken, refreshToken });
            return this.api(originalRequest);
          } catch (err) {
            this.processRefreshQueue(err, null);
            setUser(null);
            window.localStorage.removeItem("accessToken");
            window.localStorage.removeItem("refreshToken");
            return Promise.reject(err);
          } finally {
            this.isRefreshing = false;
          }
        }
        return Promise.reject(error);
      },
    );
  }

  private processRefreshQueue(
    error: unknown,
    tokens: TRefreshTokenResponse | null,
  ) {
    this.refreshQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(tokens as TRefreshTokenResponse);
      }
    });
    this.refreshQueue = [];
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const response = await this.api.get<T>(path, { params });
    return response.data;
  }

  async findMany<T>(
    path: string,
    params?: Record<string, string>,
  ): Promise<T[]> {
    const response = await this.api.get<T[]>(path, { params });
    return response.data;
  }

  async findById<T>(
    path: string,
    id: string,
    params?: Record<string, string>,
  ): Promise<T> {
    const response = await this.api.get<T>(path + `/${id}`, { params });
    return response.data;
  }

  async create<T>(path: string, data: T): Promise<T> {
    const response = await this.api.post<T>(path, data);
    return response.data;
  }

  async update<T>(path: string, id: string, data: Partial<T>): Promise<T> {
    const response = await this.api.patch<T>(path + `/${id}`, data);
    return response.data;
  }

  async updateUser<T>(path: string, data: Partial<T>): Promise<T> {
    const response = await this.api.patch<T>(path, data);
    return response.data;
  }

  async delete(path: string, id: string): Promise<void> {
    await this.api.delete(path + `/${id}`);
  }

  async deleteMany(path: string, data: { ids: string[] }): Promise<void> {
    const deleteManyPath = path.replace(/\/?$/, "/delete-many");
    await this.api.delete(deleteManyPath, { data });
  }

  async signUp(data: TSignupInput): Promise<TSignupResponse> {
    const response = await this.api.post<TSignupResponse>("/auth/signup", data);
    const { accessToken } = response.data;
    this.api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    return response.data;
  }

  async signIn(data: TSigninInput): Promise<TSigninResponse> {
    const response = await this.api.post<TSigninResponse>("/auth/signin", data);
    const { accessToken } = response.data;
    this.api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    return response.data;
  }

  async refresh(refreshToken: string): Promise<TRefreshTokenResponse> {
    const response = await this.api.post<TRefreshTokenResponse>(
      "/auth/refresh",
      {
        refreshToken,
      },
    );
    return response.data;
  }

  async verifyUser(): Promise<TUser> {
    const response = await this.api.get<{ user: TUser }>("/auth/verify");
    const user = response.data.user;
    return user;
  }

  async getFile(path: string, params?: Record<string, string>): Promise<Blob> {
    const response = await this.api.get<Blob>(path, {
      params,
      responseType: "blob",
    });
    return response.data;
  }

  async exportGraphs(body: { ids: string[]; name?: string }): Promise<Blob> {
    const response = await this.api.post<Blob>("/graphs/export", body);
    return response.data;
  }

  async signOut(): Promise<void> {
    await this.api.post("/auth/signout");
  }
}

const backendApi = new BackendApi(env.VITE_BACKEND_URL);

export { backendApi };
