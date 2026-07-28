import { render, screen } from "@testing-library/react";

import Home from "./home";

describe("ホーム画面", () => {
  it("アプリケーション名を表示する", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "nkmz 精算" })).toBeInTheDocument();
  });
});
