import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { AppFixedActionArea } from '@/components/layout/app-fixed-action-area';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { expenseClient } from '@/features/expenses/expense-client';
import { queryKeys } from '@/lib/query-keys';

function formatJpy(amount: number) {
	return `¥${amount.toLocaleString('ja-JP')}`;
}

export function meta() {
	return [{ title: '支払い一覧 | nkmz 精算' }];
}

export default function GroupDetail() {
	const { groupId = '' } = useParams();
	const { data: expenses = [] } = useQuery({
		queryKey: queryKeys.expenses(groupId),
		queryFn: () => expenseClient.list(groupId),
	});
	const totalAmount = expenses.reduce((total, expense) => total + expense.amount, 0);

	return (
		<main className="p-4 pb-24">
			<div className="mb-6 flex items-center justify-between gap-4">
				<h1 className="text-3xl font-semibold tracking-tight">支払い一覧</h1>
				<Button asChild variant="outline">
					<Link to={`/groups/${groupId}/participants`}>参加者管理</Link>
				</Button>
			</div>
			<Tabs defaultValue="payments">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="payments">支払い</TabsTrigger>
					<TabsTrigger value="settlement">精算結果</TabsTrigger>
				</TabsList>
				<TabsContent value="payments" className="pt-4">
					<Table aria-label="支払い一覧">
						<TableHeader>
							<TableRow>
								<TableHead>内容</TableHead>
								<TableHead className="text-right">立替額</TableHead>
								<TableHead>
									<span className="sr-only">編集</span>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{expenses.map((expense) => (
								<TableRow key={expense.id}>
									<TableCell className="font-medium">{expense.description}</TableCell>
									<TableCell noWrap className="text-right tabular-nums">
										{formatJpy(expense.amount)}
									</TableCell>
									<TableCell noWrap>
										<Link
											className="text-primary underline-offset-4 hover:underline"
											to={`/groups/${groupId}/expenses/${expense.id}/edit`}
										>
											編集
										</Link>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
						<TableFooter>
							<TableRow>
								<TableCell className="font-semibold">合計</TableCell>
								<TableCell noWrap className="text-right font-semibold tabular-nums">
									{formatJpy(totalAmount)}
								</TableCell>
								<TableCell />
							</TableRow>
						</TableFooter>
					</Table>
				</TabsContent>
				<TabsContent value="settlement" />
			</Tabs>
			<AppFixedActionArea>
				<Button asChild className="w-full">
					<Link to={`/groups/${groupId}/expenses/new`}>
						<Plus aria-hidden="true" />
						支払いを追加
					</Link>
				</Button>
			</AppFixedActionArea>
		</main>
	);
}
