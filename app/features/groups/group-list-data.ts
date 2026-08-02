export interface GroupListItem {
  id: string;
  name: string;
  participantCount: number;
  expenseCount: number;
}

/** グループ一覧画面を確認するための固定データ。 */
export const groupListItems = [
  {
    id: "group-summer-camp-2026",
    name: "夏合宿 2026",
    participantCount: 4,
    expenseCount: 3,
  },
  {
    id: "group-spring-drinking-party",
    name: "春の飲み会",
    participantCount: 6,
    expenseCount: 5,
  },
] satisfies GroupListItem[];
