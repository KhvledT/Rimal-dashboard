import httpClient from "./httpClient.js";
import { API_ROUTES } from "../constants/index.js";

export interface ServiceHealth {
  status: "UP" | "DOWN";
  provider?: string;
}

export interface HealthStatus {
  status: "UP" | "DOWN";
  timestamp: string;
  environment: string;
  version: string;
  uptime: {
    seconds: number;
    human: string;
  };
  runtime: {
    node: string;
  };
  services: {
    server: ServiceHealth;
    database: ServiceHealth;
    storage: ServiceHealth;
  };
}

export const healthService = {
  async checkHealth(): Promise<HealthStatus> {
    return httpClient.get(API_ROUTES.HEALTH.BASE);
  },
};
