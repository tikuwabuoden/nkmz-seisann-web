import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type SubmitEvent } from "react";
import { Navigate, useParams } from "react-router";

import { AppFixedActionArea } from "@/components/layout/app-fixed-action-area";
import { Button } from "@/components/ui/button";
import type { Participant } from "@/domain/types";
import { expenseClient } from "@/features/expenses/expense-client";
import { ExpenseFormFields } from "@/features/expenses/expense-form-fields";
import { createInitialExpenseForm, validateExpenseForm, type ExpenseFormValues } from "@/features/expenses/expense-form";
import { useDiscardConfirmation } from "@/features/expenses/use-discard-confirmation";
import { participantClient } from "@/features/participants/participant-client";
import { getApiErrorMessage } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export function meta() {
  return [{ title: "費目を追加 | nkmz 精算" }];
}

export default function ExpenseCreate() {
  const { groupId = "" } = useParams();
  const participantsQuery = useQuery({
    queryKey: queryKeys.participants(groupId),
    queryFn: () => participantClient.list(groupId),
  });

  if (participantsQuery.isPending) return <main className="p-4"><p role="status">参加者を読み込んでいます。</p></main>;
  if (participantsQuery.isError) return <main className="p-4"><p role="alert">{getApiErrorMessage(participantsQuery.error)}</p></main>;

  return <ExpenseCreateForm groupId={groupId} participants={participantsQuery.data} />;
}

interface ExpenseCreateFormProps {
  groupId: string;
  participants: Participant[];
}

function ExpenseCreateForm({ groupId, participants }: ExpenseCreateFormProps) {
  const queryClient = useQueryClient();
  const [initialForm] = useState<ExpenseFormValues>(() => createInitialExpenseForm(participants));
  const [form, setForm] = useState<ExpenseFormValues>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const discardConfirmation = useDiscardConfirmation(!isSaved && JSON.stringify(form) !== JSON.stringify(initialForm));
  const createExpense = useMutation({
    mutationFn: (input: NonNullable<ReturnType<typeof validateExpenseForm>["input"]>) => expenseClient.create(groupId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses(groupId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.settlement(groupId) });
      setIsSaved(true);
    },
  });

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateExpenseForm(form);

    setErrors(result.errors);
    if (result.input) createExpense.mutate(result.input);
  }

  if (isSaved) return <Navigate replace to={`/groups/${groupId}`} />;

  return (
    <main className="p-4 pb-24">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">費目を追加</h1>
      <form className="space-y-6" id="expense-create-form" onSubmit={handleSubmit}>
        <ExpenseFormFields form={form} participants={participants} onChange={setForm} />
        {errors.length > 0 ? <ul className="space-y-1 text-sm text-destructive" role="alert">{errors.map((error) => <li key={error}>{error}</li>)}</ul> : null}
        {createExpense.isError ? <p role="alert">{getApiErrorMessage(createExpense.error)}</p> : null}
      </form>
      <AppFixedActionArea><Button className="w-full" disabled={createExpense.isPending} form="expense-create-form" type="submit">保存する</Button></AppFixedActionArea>
      {discardConfirmation}
    </main>
  );
}
