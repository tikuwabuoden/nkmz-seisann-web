import { QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";

import type { ApiClient, ApiRequestOptions } from "@/lib/api-client";
import { createQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";

type TestGroup = {
  id: string;
  name: string;
};

const testGroupsPath = "/test/groups";

function useGroups(client: ApiClient) {
  const queryClient = useQueryClient();
  const groups = useQuery({
    queryKey: queryKeys.groups,
    queryFn: () => client.request<TestGroup[]>(testGroupsPath),
  });
  const createGroup = useMutation({
    mutationFn: () => client.request<TestGroup>(testGroupsPath, { body: { name: "夏合宿" }, method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.groups }),
  });

  return { createGroup, groups };
}

describe("TanStack Query の基盤", () => {
  it("モック API で取得と作成を行い、作成後にグループ一覧を再取得する", async () => {
    const initialGroup = { id: "group-1", name: "春の飲み会" };
    const createdGroup = { id: "group-2", name: "夏合宿" };
    const groups = [initialGroup];
    const requests: Array<{ options: Parameters<ApiClient["request"]>[1]; path: string }> = [];
    const client: ApiClient = {
      async request<T>(path: string, options?: ApiRequestOptions): Promise<T> {
        requests.push({ options, path });

        if (options?.method === "POST") {
          groups.push(createdGroup);
          return createdGroup as T;
        }

        return groups as T;
      },
    };
    const queryClient = createQueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useGroups(client), { wrapper });

    await waitFor(() => expect(result.current.groups.data).toEqual([initialGroup]));

    await act(async () => {
      await result.current.createGroup.mutateAsync();
    });

    await waitFor(() => expect(result.current.groups.data).toEqual([initialGroup, createdGroup]));
    expect(requests).toEqual([
      { options: undefined, path: testGroupsPath },
      { options: { body: { name: "夏合宿" }, method: "POST" }, path: testGroupsPath },
      { options: undefined, path: testGroupsPath },
    ]);
  });
});
