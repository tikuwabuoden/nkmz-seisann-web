import { groupListItems, type GroupListItem } from "@/features/groups/group-list-data";
import { apiUrl, createApiClient, type ApiClient } from "@/lib/api-client";

export interface GroupClient {
  list(): Promise<GroupListItem[]>;
  create(input: CreateGroupInput): Promise<GroupListItem>;
}

export interface CreateGroupInput {
  name: string;
}

interface ApiExpenseGroup {
  id: string;
  name: string;
}

interface ApiExpenseGroupDetail extends ApiExpenseGroup {
  participants: unknown[];
}

interface ApiGroupListResponse {
  items: ApiExpenseGroup[];
  nextCursor: string | null;
}

interface ApiExpenseListResponse {
  items: unknown[];
  nextCursor: string | null;
}

function appendQuery(path: string, parameters: Record<string, string>): string {
  const searchParameters = new URLSearchParams(parameters);

  return `${path}?${searchParameters.toString()}`;
}

async function listAllGroups(client: ApiClient): Promise<ApiExpenseGroup[]> {
  const groups: ApiExpenseGroup[] = [];
  let cursor: string | null = null;

  do {
    const path: string = cursor ? appendQuery("/expense-groups", { cursor }) : "/expense-groups";
    const response: ApiGroupListResponse | undefined = await client.request<ApiGroupListResponse>(apiUrl(path));

    if (!response) throw new Error("グループ一覧の応答が空です。");
    groups.push(...response.items);
    cursor = response.nextCursor;
  } while (cursor);

  return groups;
}

async function countExpenses(client: ApiClient, groupId: string): Promise<number> {
  let count = 0;
  let cursor: string | null = null;

  do {
    const path = appendQuery(`/expense-groups/${groupId}/expenses`, cursor ? { cursor, limit: "100" } : { limit: "100" });
    const response = await client.request<ApiExpenseListResponse>(apiUrl(path));

    if (!response) throw new Error("費目一覧の応答が空です。");
    count += response.items.length;
    cursor = response.nextCursor;
  } while (cursor);

  return count;
}

/** nkmz API を使うグループクライアントを作成する。 */
export function createNkmzGroupClient(client: ApiClient = createApiClient()): GroupClient {
  return {
    async list() {
      const groups = await listAllGroups(client);

      return Promise.all(
        groups.map(async (group) => {
          const [participants, expenseCount] = await Promise.all([
            client.request<unknown[]>(apiUrl(`/expense-groups/${group.id}/participants`)),
            countExpenses(client, group.id),
          ]);

          if (!participants) throw new Error("参加者一覧の応答が空です。");

          return {
            id: group.id,
            name: group.name,
            participantCount: participants.length,
            expenseCount,
          };
        }),
      );
    },
    async create(input) {
      const group = await client.request<ApiExpenseGroupDetail>(apiUrl("/expense-groups"), {
        body: input,
        method: "POST",
      });

      if (!group) throw new Error("グループ作成の応答が空です。");

      return {
        id: group.id,
        name: group.name,
        participantCount: group.participants.length,
        expenseCount: 0,
      };
    },
  };
}

/** 画面テスト用のグループクライアントを作成する。 */
export function createMockGroupClient(initialGroups: GroupListItem[] = groupListItems): GroupClient {
  const groups = initialGroups.map((group) => ({ ...group }));
  let nextGroupNumber = 1;
  return {
    async list() {
      return groups.map((group) => ({ ...group }));
    },
    async create({ name }) {
      const group = { id: `mock-group-${nextGroupNumber++}`, name, participantCount: 1, expenseCount: 0 };
      groups.push(group);
      return { ...group };
    },
  };
}

export const groupClient = createNkmzGroupClient();
