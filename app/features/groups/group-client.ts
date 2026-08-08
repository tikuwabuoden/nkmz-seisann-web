import { groupListItems, type GroupListItem } from "@/features/groups/group-list-data";

export interface GroupClient {
  list(): Promise<GroupListItem[]>;
  create(input: CreateGroupInput): Promise<GroupListItem>;
}

export interface CreateGroupInput {
  name: string;
}

/** #28 で実 API クライアントに差し替えるまで使用する精算グループ操作のモック。 */
export function createMockGroupClient(initialGroups: GroupListItem[] = groupListItems): GroupClient {
  const groups = initialGroups.map((group) => ({ ...group }));
  let nextGroupNumber = 1;

  return {
    async list() {
      return groups.map((group) => ({ ...group }));
    },
    async create({ name }) {
      const group = {
        id: `mock-group-${nextGroupNumber++}`,
        name,
        participantCount: 1,
        expenseCount: 0,
      };

      groups.push(group);
      return { ...group };
    },
  };
}

export const groupClient = createMockGroupClient();
