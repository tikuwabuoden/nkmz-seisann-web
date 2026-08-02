import { render, screen } from "@testing-library/react";

import NotFound from "./not-found";

describe("未登録 URL 画面", () => {
  it("ページが見つからないことを表示する", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "ページが見つかりません" })).toBeInTheDocument();
  });
});
