export type ApiRequestOptions = Omit<RequestInit, "body" | "credentials"> & {
  body?: unknown;
};

export interface ApiClient {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
  ) {
    super(`API リクエストに失敗しました: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

/** Cookie を含めて JSON API を呼び出すクライアントを生成する。 */
export function createApiClient(fetchFunction: typeof fetch = fetch): ApiClient {
  return {
    async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
      const { body, headers: requestHeaders, ...requestOptions } = options;
      const headers = new Headers(requestHeaders);

      if (body !== undefined && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetchFunction(path, {
        ...requestOptions,
        body: body === undefined ? undefined : JSON.stringify(body),
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
      }

      return (await response.json()) as T;
    },
  };
}
