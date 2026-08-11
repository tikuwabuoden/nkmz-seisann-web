import { render, screen, within } from "@testing-library/react";

import { emptySettlement, sampleSettlement, users } from "@/domain/test-data";

import { SettlementResults } from "./settlement-results";

describe("精算結果の表示", () => {
  it("支払側には送る相手と金額を表示する", () => {
    render(<SettlementResults currentUserId={users.bob.id} settlement={sampleSettlement} />);

    const personalSettlement = screen.getByRole("table", { name: "あなたの精算" });

    expect(within(personalSettlement).getAllByRole("rowheader", { name: "送る相手" })).toHaveLength(2);
    expect(within(personalSettlement).getByText("akira")).toBeInTheDocument();
    expect(within(personalSettlement).getByText("¥764")).toBeInTheDocument();
    expect(within(personalSettlement).getByText("¥990")).toBeInTheDocument();
  });

  it("受取側には受け取る相手と金額を表示する", () => {
    render(<SettlementResults currentUserId={users.carol.id} settlement={sampleSettlement} />);

    const personalSettlement = screen.getByRole("table", { name: "あなたの精算" });

    expect(within(personalSettlement).getByRole("rowheader", { name: "受け取る相手" })).toBeInTheDocument();
    expect(within(personalSettlement).getByText("yu")).toBeInTheDocument();
    expect(within(personalSettlement).getByText("¥990")).toBeInTheDocument();
  });

  it("送金がない場合は精算不要を表示する", () => {
    render(<SettlementResults currentUserId={users.alice.id} settlement={emptySettlement} />);

    expect(screen.getByText("精算不要です。")).toBeInTheDocument();
    expect(screen.getByText("送金案はありません。")).toBeInTheDocument();
  });

  it("全員分の最終送金案を表示する", () => {
    render(<SettlementResults currentUserId={users.alice.id} settlement={sampleSettlement} />);

    const transfers = screen.getByRole("table", { name: "最終送金案" });

    expect(within(transfers).getAllByRole("cell", { name: "yu" })).toHaveLength(2);
    expect(within(transfers).getByRole("cell", { name: "saki" })).toBeInTheDocument();
    expect(within(transfers).getByText("¥764")).toBeInTheDocument();
    expect(within(transfers).getByText("¥990")).toBeInTheDocument();
  });
});
