// src/lib/rest.ts
import axios, { AxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Cliente de axios
const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Wrapper de requests
export const rest = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const { data } = await client.get<T>(url, config);
    return data;
  },
  post: async <T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> => {
    const { data } = await client.post<T>(url, body, config);
    return data;
  },
  patch: async <T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> => {
    const { data } = await client.patch<T>(url, body, config);
    return data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const { data } = await client.delete<T>(url, config);
    return data;
  },
};

// 👇 Alias más legibles (opcional)
export const getJSON = rest.get;
export const postJSON = rest.post;
export const patchJSON = rest.patch;
export const deleteJSON = rest.delete;
