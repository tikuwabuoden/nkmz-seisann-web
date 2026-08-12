export type ApiRequestOptions = Omit<RequestInit, "body" | "credentials"> & {
  body?: unknown;
};

export interface ApiClient {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T | undefined>;
}

interface ErrorResponseBody {
  error?: {
    code?: unknown;
    message?: unknown;
  };
}

interface ApiErrorDetail {
  code?: string;
  message?: string;
}

/** API が HTTP エラーを返した場合のエラー。 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly code?: string,
    message?: string,
  ) {
    super(message ?? `API request failed: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

/** API に接続できなかった場合のエラー。 */
export class ApiNetworkError extends Error {
  constructor(public readonly cause: unknown) {
    super("API に接続できませんでした。");
    this.name = "ApiNetworkError";
  }
}

/** API が期待した JSON を返さなかった場合のエラー。 */
export class ApiResponseFormatError extends Error {
  constructor() {
    super("API の応答形式が不正です。");
    this.name = "ApiResponseFormatError";
  }
}

/** 画面に表示する API エラーメッセージを返す。 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiNetworkError) return "通信に失敗しました。再試行してください。";
  if (error instanceof ApiResponseFormatError) return "予期しない応答を受信しました。再試行してください。";
  if (!(error instanceof ApiError)) return "予期しないエラーが発生しました。再試行してください。";

  switch (error.status) {
    case 400:
      return error.message || "入力内容を確認してください。";
    case 401:
      return "ログインが必要です。";
    case 403:
      return "この操作を行う権限がありません。";
    case 404:
      return "対象が見つかりません。";
    case 409:
      return "他の変更と競合しました。最新の状態を確認してください。";
    default:
      return "操作に失敗しました。再試行してください。";
  }
}

/** 環境変数で指定された API のベース URL をパスへ適用する。 */
export function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  return baseUrl ? new URL(path, baseUrl).toString() : path;
}

function parseErrorResponse(body: string): ApiErrorDetail {
  if (!body.trim()) return {};

  try {
    const parsed = JSON.parse(body) as ErrorResponseBody;
    const code = typeof parsed.error?.code === "string" ? parsed.error.code : undefined;
    const message = typeof parsed.error?.message === "string" ? parsed.error.message : undefined;

    return { code, message };
  } catch {
    return {};
  }
}

/** Cookie を含めて JSON API を呼び出すクライアントを作成する。 */
export function createApiClient(fetchFunction: typeof fetch = fetch): ApiClient {
  return {
    async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T | undefined> {
      const { body, headers: requestHeaders, ...requestOptions } = options;
      const headers = new Headers(requestHeaders);

      if (body !== undefined && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      let response: Response;
      try {
        response = await fetchFunction(path, {
          ...requestOptions,
          body: body === undefined ? undefined : JSON.stringify(body),
          credentials: "include",
          headers,
        });
      } catch (error) {
        throw new ApiNetworkError(error);
      }

      if (!response.ok) {
        const error = parseErrorResponse(await response.text());
        throw new ApiError(response.status, response.statusText, error.code, error.message);
      }

      const responseBody = await response.text();

      if (responseBody.trim() === "") {
        return undefined;
      }

      try {
        return JSON.parse(responseBody) as T;
      } catch {
        throw new ApiResponseFormatError();
      }
    },
  };
}
