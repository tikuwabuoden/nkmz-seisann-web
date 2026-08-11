import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type SubmitEvent } from 'react';
import { useNavigate, useParams } from 'react-router';

import { AppFixedActionArea } from '@/components/layout/app-fixed-action-area';
import { Button } from '@/components/ui/button';
import type { Expense, Participant } from '@/domain/types';
import { expenseClient } from '@/features/expenses/expense-client';
import { ExpenseFormFields } from '@/features/expenses/expense-form-fields';
import {
	createExpenseEditForm,
	validateExpenseForm,
	type ExpenseFormValues,
} from '@/features/expenses/expense-form';
import { participantClient } from '@/features/participants/participant-client';
import { queryKeys } from '@/lib/query-keys';

export function meta() {
	return [{ title: '費目を編集 | nkmz 精算' }];
}

export default function ExpenseEdit() {
	const { groupId = '', expenseId = '' } = useParams();
	const participantsQuery = useQuery({
		queryKey: queryKeys.participants(groupId),
		queryFn: () => participantClient.list(groupId),
	});
	const expenseQuery = useQuery({
		queryKey: queryKeys.expense(groupId, expenseId),
		queryFn: () => expenseClient.get(groupId, expenseId),
	});

	if (participantsQuery.isPending || expenseQuery.isPending)
		return (
			<main className="p-4">
				<p role="status">費目を読み込んでいます。</p>
			</main>
		);
	if (participantsQuery.isError || expenseQuery.isError)
		return (
			<main className="p-4">
				<p role="alert">費目の取得に失敗しました。</p>
			</main>
		);
	if (!expenseQuery.data)
		return (
			<main className="p-4">
				<p role="alert">費目が見つかりません。</p>
			</main>
		);

	return (
		<ExpenseEditForm
			expense={expenseQuery.data}
			groupId={groupId}
			participants={participantsQuery.data}
		/>
	);
}

interface ExpenseEditFormProps {
	expense: Expense;
	groupId: string;
	participants: Participant[];
}

function ExpenseEditForm({ expense, groupId, participants }: ExpenseEditFormProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [form, setForm] = useState<ExpenseFormValues>(() => createExpenseEditForm(expense));
	const [errors, setErrors] = useState<string[]>([]);
	const updateExpense = useMutation({
		mutationFn: (input: NonNullable<ReturnType<typeof validateExpenseForm>['input']>) =>
			expenseClient.update(groupId, expense.id, input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.expenses(groupId) });
			await queryClient.invalidateQueries({ queryKey: queryKeys.expense(groupId, expense.id) });
			navigate(`/groups/${groupId}`);
		},
	});

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const result = validateExpenseForm(form);

		setErrors(result.errors);
		if (result.input) updateExpense.mutate(result.input);
	}

	return (
		<main className="p-4 pb-24">
			<h1 className="mb-6 text-3xl font-semibold tracking-tight">費目を編集</h1>
			<form className="space-y-6" id="expense-edit-form" onSubmit={handleSubmit}>
				<ExpenseFormFields form={form} participants={participants} onChange={setForm} />
				{errors.length > 0 ? (
					<ul className="space-y-1 text-sm text-destructive" role="alert">
						{errors.map((error) => (
							<li key={error}>{error}</li>
						))}
					</ul>
				) : null}
				{updateExpense.isError ? <p role="alert">費目の保存に失敗しました。</p> : null}
			</form>
			<AppFixedActionArea>
				<Button
					className="w-full"
					disabled={updateExpense.isPending}
					form="expense-edit-form"
					type="submit"
				>
					保存する
				</Button>
			</AppFixedActionArea>
		</main>
	);
}
