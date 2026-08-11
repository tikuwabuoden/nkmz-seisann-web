import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type SubmitEvent } from 'react';
import { Navigate, useParams } from 'react-router';

import { AppFixedActionArea } from '@/components/layout/app-fixed-action-area';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import type { Expense, Participant } from '@/domain/types';
import { expenseClient } from '@/features/expenses/expense-client';
import { ExpenseFormFields } from '@/features/expenses/expense-form-fields';
import { useDiscardConfirmation } from '@/features/expenses/use-discard-confirmation';
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
	const queryClient = useQueryClient();
	const [initialForm] = useState<ExpenseFormValues>(() => createExpenseEditForm(expense));
	const [form, setForm] = useState<ExpenseFormValues>(initialForm);
	const [errors, setErrors] = useState<string[]>([]);
	const [hasFinished, setHasFinished] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const discardConfirmation = useDiscardConfirmation(!hasFinished && JSON.stringify(form) !== JSON.stringify(initialForm));
	const updateExpense = useMutation({
		mutationFn: (input: NonNullable<ReturnType<typeof validateExpenseForm>['input']>) =>
			expenseClient.update(groupId, expense.id, input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.expenses(groupId) });
			await queryClient.invalidateQueries({ queryKey: queryKeys.expense(groupId, expense.id) });
			setHasFinished(true);
		},
	});
	const deleteExpense = useMutation({
		mutationFn: () => expenseClient.delete(groupId, expense.id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.expenses(groupId) });
			await queryClient.invalidateQueries({ queryKey: queryKeys.expense(groupId, expense.id) });
			setHasFinished(true);
		},
	});

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const result = validateExpenseForm(form);

		setErrors(result.errors);
		if (result.input) updateExpense.mutate(result.input);
	}

	if (hasFinished) return <Navigate replace to={`/groups/${groupId}`} />;

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
					className="flex-1"
					disabled={deleteExpense.isPending || updateExpense.isPending}
					onClick={() => setIsDeleteDialogOpen(true)}
					type="button"
					variant="destructive"
				>
					削除
				</Button>
				<Button
					className="flex-1"
					disabled={updateExpense.isPending || deleteExpense.isPending}
					form="expense-edit-form"
					type="submit"
				>
					保存する
				</Button>
			</AppFixedActionArea>
			<Dialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
				<DialogContent showCloseButton={false}>
					<DialogHeader>
						<DialogTitle>費目を削除しますか？</DialogTitle>
						<DialogDescription>
							削除した費目は元に戻せません。
						</DialogDescription>
					</DialogHeader>
					{deleteExpense.isError ? <p role="alert">費目の削除に失敗しました。</p> : null}
					<DialogFooter>
						<DialogClose asChild>
							<Button disabled={deleteExpense.isPending} type="button" variant="outline">
								キャンセル
							</Button>
						</DialogClose>
						<Button
							disabled={deleteExpense.isPending}
							onClick={() => deleteExpense.mutate()}
							type="button"
							variant="destructive"
						>
							削除する
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{discardConfirmation}
		</main>
	);
}
