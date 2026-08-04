import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "@/lib/api-client";

describe("API クライアント", () => {
  it("Cookie を含めて JSON リクエストを送信し、レスポンスを返す", async () => {
    const fetchFunction = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: "group-1" }), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createApiClient(fetchFunction);

    await expect(client.request<{ id: string }>("/resource", { body: { name: "夏合宿" }, method: "POST" })).resolves.toEqual({
      id: "group-1",
    });

    const [, request] = fetchFunction.mock.calls[0] ?? [];
    expect(request?.credentials).toBe("include");
    expect(request?.body).toBe(JSON.stringify({ name: "夏合宿" }));
    expect(new Headers(request?.headers).get("Content-Type")).toBe("application/json");
  });

  it("失敗したレスポンスではステータスを含むエラーを返す", async () => {
    const fetchFunction = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 401, statusText: "Unauthorized" }));
    const client = createApiClient(fetchFunction);

    await expect(client.request("/resource")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      statusText: "Unauthorized",
    });
  });

  it.each([
    ["204 No Content", new Response(null, { status: 204 })],
    ["本文が空の成功レスポンス", new Response(null, { status: 200 })],
  ])("%s では undefined を返す", async (_description, response) => {
    const fetchFunction = vi.fn<typeof fetch>().mockResolvedValue(response);
    const client = createApiClient(fetchFunction);

    await expect(client.request("/resource", { method: "DELETE" })).resolves.toBeUndefined();
  });
});
