import { ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Participant } from "@/domain/types";

import type { ExpenseFormValues } from "./expense-form";

interface ExpenseFormFieldsProps {
  form: ExpenseFormValues;
  participants: Participant[];
  onChange: (form: ExpenseFormValues) => void;
}

export function ExpenseFormFields({ form, participants, onChange }: ExpenseFormFieldsProps) {
  const payerOptions = participants.filter(
    (participant) => participant.active || participant.id === form.payers[0]?.participantId,
  );

  return (
    <>
      <label className="block space-y-2" htmlFor="expense-description">
        <span className="font-medium">内容</span>
        <Input
          id="expense-description"
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
        />
      </label>
      <label className="block space-y-2" htmlFor="expense-amount">
        <span className="font-medium">総額</span>
        <Input
          id="expense-amount"
          inputMode="numeric"
          value={form.amount}
          onChange={(event) =>
            onChange({
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
            value={form.payers[0]?.participantId ?? ""}
            onChange={(event) =>
              onChange({
                ...form,
                payers: [{ participantId: event.target.value, amount: form.amount }],
              })
            }
          >
            {payerOptions.map((participant) => (
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
          onChange={(event) => onChange({ ...form, note: event.target.value })}
        />
      </label>
      <section className="space-y-3">
        <h2 className="bg-blue-50 p-3 text-xl font-semibold">負担者・重み</h2>
        <p className="text-sm text-muted-foreground">0は負担しません。小数第2位まで入力できます。</p>
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
                  {participants.find((participant) => participant.id === share.participantId)?.username}
                </TableCell>
                <TableCell>
                  <Input
                    inputMode="decimal"
                    value={share.weight}
                    onChange={(event) =>
                      onChange({
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
    </>
  );
}
