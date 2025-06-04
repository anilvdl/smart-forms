import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  correlationId: string;
  startTime: [number, number];
  method: string;
  url: string;
  apiKey?: string;
  clientIp?: string;
  user?: {
    id?: string;
    email?: string;
    org?: string;
    exp?: number;
  };
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}
