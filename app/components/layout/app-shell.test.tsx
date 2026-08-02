import { render, screen } from "@testing-library/react";

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("子要素を表示し、画面幅を430pxに制限する", () => {
    render(
      <AppShell>
        <p>画面の内容</p>
      </AppShell>,
    );

    expect(screen.getByText("画面の内容").parentElement).toHaveClass("max-w-[430px]", "mx-auto");
  });
});
