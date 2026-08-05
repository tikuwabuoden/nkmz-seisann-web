import { render, screen } from "@testing-library/react";

import GroupCreate from "./group-create";

describe("精算グループ作成画面", () => {
  it("グループ名の入力欄と作成操作を表示する", () => {
    render(<GroupCreate />);

    expect(screen.getByRole("heading", { name: "精算グループを作成" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "グループ名" })).toBeInTheDocument();
    expect(screen.getByText("作成者は最初の参加者になります")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "作成する" })).toBeInTheDocument();
  });
});
