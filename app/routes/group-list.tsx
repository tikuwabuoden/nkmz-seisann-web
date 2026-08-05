import { ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { AppFixedActionArea } from "@/components/layout/app-fixed-action-area";
import { Button } from "@/components/ui/button";
import { groupListClient } from "@/features/groups/group-list-client";
import { queryKeys } from "@/lib/query-keys";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function meta() {
  return [{ title: "精算グループ | nkmz 精算" }];
}

export default function GroupList() {
  const { data: groups = [] } = useQuery({
    queryKey: queryKeys.groups,
    queryFn: () => groupListClient.list(),
  });

  return (
    <main className="p-4 pb-24">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">精算グループ</h1>
      <Table aria-label="精算グループ一覧">
        <TableHeader>
          <TableRow>
            <TableHead>グループ名</TableHead>
            <TableHead className="text-center">参加者</TableHead>
            <TableHead className="text-center">費目</TableHead>
            <TableHead>
              <span className="sr-only">詳細</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id}>
              <TableCell className="font-medium">{group.name}</TableCell>
              <TableCell noWrap className="text-center">
                {group.participantCount}人
              </TableCell>
              <TableCell noWrap className="text-center">
                {group.expenseCount}件
              </TableCell>
              <TableCell noWrap>
                <Link
                  aria-label={`${group.name}の詳細を開く`}
                  className="ml-auto flex size-11 items-center justify-center text-primary"
                  to={`/groups/${group.id}`}
                >
                  <ChevronRight aria-hidden="true" className="size-5" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AppFixedActionArea>
        <Button asChild className="w-full">
          <Link to="/groups/new">
            <Plus aria-hidden="true" />
            精算グループを作成
          </Link>
        </Button>
      </AppFixedActionArea>
    </main>
  );
}
