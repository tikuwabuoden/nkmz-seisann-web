import { describe, expect, it, vi } from "vitest";

import { ApiError, type ApiClient } from "@/lib/api-client";

import { createAuthClient } from "./auth-client";

describe("認証APIクライアント", () => {
  it("未認証の401応答を未ログインとして返す", async () => {
    const client: ApiClient = {
      request: vi.fn().mockRejectedValue(new ApiError(401, "Unauthorized")),
    };
    const authClient = createAuthClient(client);

    await expect(authClient.getCurrentUser()).resolves.toBeNull();
  });
});
