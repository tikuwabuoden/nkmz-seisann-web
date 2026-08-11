import type { NkmzUser } from "@/domain/types";
import { ApiError, createApiClient, type ApiClient } from "@/lib/api-client";

export interface AuthClient {
  getCurrentUser(): Promise<NkmzUser | null>;
  startDiscordLogin(redirectTo: string): void;
}

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  return baseUrl ? new URL(path, baseUrl).toString() : path;
}

export function createAuthClient(
  client: ApiClient = createApiClient(),
  location?: Pick<Location, "assign">,
): AuthClient {
  return {
    async getCurrentUser() {
      try {
        return (await client.request<NkmzUser>(apiUrl("/auth/me"))) ?? null;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }

        throw error;
      }
    },
    startDiscordLogin(redirectTo) {
      if (!location) {
        throw new Error("Discordログインはブラウザ上で開始してください。");
      }

      const loginUrl = new URL(apiUrl("/auth/discord/start"), redirectTo);
      loginUrl.searchParams.set("redirect", redirectTo);
      location.assign(loginUrl.toString());
    },
  };
}

export const authClient = createAuthClient(
  createApiClient(),
  typeof window === "undefined" ? undefined : window.location,
);
