import { describe, expect, it, vi } from "vitest";

import {
  ApiNetworkError,
  ApiResponseFormatError,
  createApiClient,
  getApiErrorMessage,
} from "@/lib/api-client";

describe("APIクライアント", () => {
  it("Cookie を含めて JSON リクエストを送信し、レスポンスを返す", async () => {
    const fetchFunction = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: "group-1" }), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createApiClient(fetchFunction);

    await expect(client.request<{ id: string }>("/resource", { body: { name: "旅行" }, method: "POST" })).resolves.toEqual({
      id: "group-1",
    });

    const [, request] = fetchFunction.mock.calls[0] ?? [];
    expect(request?.credentials).toBe("include");
    expect(request?.body).toBe(JSON.stringify({ name: "旅行" }));
    expect(new Headers(request?.headers).get("Content-Type")).toBe("application/json");
  });

  it("API のエラー詳細を取得する", async () => {
    const fetchFunction = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: "INVALID_REQUEST", message: "名前は必須です。" } }), { status: 400 }),
    );
    const client = createApiClient(fetchFunction);

    await expect(client.request("/resource")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      code: "INVALID_REQUEST",
      message: "名前は必須です。",
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

  it("API へ接続できない場合を区別する", async () => {
    const client = createApiClient(vi.fn<typeof fetch>().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(client.request("/resource")).rejects.toBeInstanceOf(ApiNetworkError);
  });

  it("壊れた JSON の成功応答を区別する", async () => {
    const client = createApiClient(vi.fn<typeof fetch>().mockResolvedValue(new Response("not json")));

    await expect(client.request("/resource")).rejects.toBeInstanceOf(ApiResponseFormatError);
  });

  it.each([
    [new ApiNetworkError(new TypeError()), "通信に失敗しました。再試行してください。"],
    [new ApiResponseFormatError(), "予期しない応答を受信しました。再試行してください。"],
  ])("画面向けのエラーメッセージを返す", (error, expected) => {
    expect(getApiErrorMessage(error)).toBe(expected);
  });
});
