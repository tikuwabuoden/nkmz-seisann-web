import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { sampleGroup } from "@/domain/test-data";

import { ExpenseFormFields } from "./expense-form-fields";
import type { ExpenseFormValues } from "./expense-form";

const initialForm: ExpenseFormValues = {
  description: "新幹線代",
  amount: "1000",
  note: "",
  payers: [{ participantId: "participant-alice", amount: "1000" }],
  shares: [
    { participantId: "participant-alice", weight: "1" },
    { participantId: "participant-bob", weight: "1" },
    { participantId: "participant-carol", weight: "1" },
  ],
};

function ExpenseFormFieldsHarness() {
  const [form, setForm] = useState(initialForm);

  return <ExpenseFormFields form={form} participants={sampleGroup.participants} onChange={setForm} />;
}

describe("費目フォームの分担額プレビュー", () => {
  it("総額と重みに応じた分担額を表示し、入力変更時に更新する", () => {
    render(<ExpenseFormFieldsHarness />);

    expect(screen.getAllByRole("cell", { name: "¥333" })).toHaveLength(2);
    expect(screen.getByRole("cell", { name: "¥334" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("総額"), { target: { value: "1" } });
    expect(screen.getAllByRole("cell", { name: "¥0" })).toHaveLength(2);
    expect(screen.getByRole("cell", { name: "¥1" })).toBeInTheDocument();
  });
});
