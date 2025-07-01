import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getRequestContext } from './context';

export const httpClient: AxiosInstance = axios.create();

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const ctx = getRequestContext();
  if (ctx?.correlationId) {
    config.headers = config.headers || {};
    config.headers['x-correlation-id'] = ctx.correlationId;
  }
  return config;
});

export async function fetchWithContext(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const ctx = getRequestContext();
  const headers = {
    ...(init?.headers || {}),
    ...(ctx?.correlationId ? { 'x-correlation-id': ctx.correlationId } : {}),
  };
  return fetch(input, { ...init, headers });
}
