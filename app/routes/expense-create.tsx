import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';

import { AppFixedActionArea } from '@/components/layout/app-fixed-action-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	createInitialExpenseForm,
	validateExpenseForm,
	type ExpenseFormValues,
} from '@/features/expenses/expense-form';
import { expenseClient } from '@/features/expenses/expense-client';
import { participantClient } from '@/features/participants/participant-client';
import { queryKeys } from '@/lib/query-keys';

export function meta() {
	return [{ title: '費目を追加 | nkmz 精算' }];
}

export default function ExpenseCreate() {
	const { groupId = '' } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [form, setForm] = useState<ExpenseFormValues | null>(null);
	const [errors, setErrors] = useState<string[]>([]);
	const participantsQuery = useQuery({
		queryKey: queryKeys.participants(groupId),
		queryFn: () => participantClient.list(groupId),
	});
	const createExpense = useMutation({
		mutationFn: (input: NonNullable<ReturnType<typeof validateExpenseForm>['input']>) =>
			expenseClient.create(groupId, input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.expenses(groupId) });
			navigate(`/groups/${groupId}`);
		},
	});

	useEffect(() => {
		if (participantsQuery.data && form === null) {
			setForm(createInitialExpenseForm(participantsQuery.data));
		}
	}, [form, participantsQuery.data]);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!form) return;
		const result = validateExpenseForm(form);

		setErrors(result.errors);
		if (result.input) createExpense.mutate(result.input);
	}

	if (participantsQuery.isPending || !form)
		return (
			<main className="p-4">
				<p role="status">参加者を読み込んでいます。</p>
			</main>
		);
	if (participantsQuery.isError)
		return (
			<main className="p-4">
				<p role="alert">参加者の取得に失敗しました。</p>
			</main>
		);

	return (
		<main className="p-4 pb-24">
			<h1 className="mb-6 text-3xl font-semibold tracking-tight">費目を追加</h1>
			<form className="space-y-6" id="expense-create-form" onSubmit={handleSubmit}>
				<label className="block space-y-2" htmlFor="expense-description">
					<span className="font-medium">内容</span>
					<Input
						id="expense-description"
						value={form.description}
						onChange={(event) => setForm({ ...form, description: event.target.value })}
					/>
				</label>
				<label className="block space-y-2" htmlFor="expense-amount">
					<span className="font-medium">総額</span>
					<Input
						id="expense-amount"
						inputMode="numeric"
						value={form.amount}
						onChange={(event) =>
							setForm({
								...form,
								amount: event.target.value,
								payers: form.payers.map((payer) => ({ ...payer, amount: event.target.value })),
							})
						}
					/>
				</label>
				<label className="block space-y-2" htmlFor="expense-payer">
					<span className="font-medium">立替者</span>
					<span className="relative block">
						<select
							className="flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
							id="expense-payer"
							value={form.payers[0]?.participantId ?? ''}
							onChange={(event) =>
								setForm({
									...form,
									payers: [{ participantId: event.target.value, amount: form.amount }],
								})
							}
						>
							{participantsQuery.data
								.filter((participant) => participant.active)
								.map((participant) => (
									<option key={participant.id} value={participant.id}>
										{participant.username}
									</option>
								))}
						</select>
						<ChevronDown
							aria-hidden="true"
							className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
						/>
					</span>
				</label>
				<label className="block space-y-2" htmlFor="expense-note">
					<span className="font-medium">メモ（任意）</span>
					<textarea
						className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base"
						id="expense-note"
						value={form.note}
						onChange={(event) => setForm({ ...form, note: event.target.value })}
					/>
				</label>
				<section className="space-y-3">
					<h2 className="bg-blue-50 p-3 text-xl font-semibold">負担者・重み</h2>
					<p className="text-sm text-muted-foreground">
						0は負担しません。小数第2位まで入力できます。
					</p>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>参加者</TableHead>
								<TableHead>重み</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{form.shares.map((share, index) => (
								<TableRow key={share.participantId}>
									<TableCell>
										{
											participantsQuery.data.find(
												(participant) => participant.id === share.participantId,
											)?.username
										}
									</TableCell>
									<TableCell>
										<Input
											inputMode="decimal"
											value={share.weight}
											onChange={(event) =>
												setForm({
													...form,
													shares: form.shares.map((item, itemIndex) =>
														itemIndex === index ? { ...item, weight: event.target.value } : item,
													),
												})
											}
										/>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</section>
				{errors.length > 0 ? (
					<ul className="space-y-1 text-sm text-destructive" role="alert">
						{errors.map((error) => (
							<li key={error}>{error}</li>
						))}
					</ul>
				) : null}
				{createExpense.isError ? <p role="alert">費目の保存に失敗しました。</p> : null}
			</form>
			<AppFixedActionArea>
				<Button
					className="w-full"
					disabled={createExpense.isPending}
					form="expense-create-form"
					type="submit"
				>
					保存する
				</Button>
			</AppFixedActionArea>
		</main>
	);
}
