import { QueryClient } from "@tanstack/react-query";

/**
 * アプリケーションで利用する QueryClient を生成する。
 *
 * モジュール全体でキャッシュを共有しないよう、Provider を表示するタイミングで呼び出す。
 */
export function createQueryClient() {
  return new QueryClient();
}
