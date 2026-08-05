import { groupListItems, type GroupListItem } from "@/features/groups/group-list-data";

export interface GroupListClient {
  list(): Promise<GroupListItem[]>;
}

/** #28 で実 API クライアントに差し替えるまで使用する一覧取得のモック。 */
export const groupListClient: GroupListClient = {
  async list() {
    return groupListItems;
  },
};
