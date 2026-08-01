import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { AppHeader } from "./app-header";

describe("AppHeader", () => {
  it("ルート以外では左に戻る操作、中央にアプリケーション名を表示する", () => {
    render(
      <MemoryRouter initialEntries={["/groups"]}>
        <AppHeader />
      </MemoryRouter>,
    );

    expect(screen.getByRole("banner")).toHaveTextContent("nkmz 精算");
    expect(screen.getByRole("button", { name: "戻る" })).toHaveClass("absolute", "left-0");
  });

  it("ルートでは戻る操作を表示しない", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppHeader />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("button", { name: "戻る" })).not.toBeInTheDocument();
  });
});
