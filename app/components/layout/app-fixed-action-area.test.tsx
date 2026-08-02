import { render, screen } from "@testing-library/react";

import { AppFixedActionArea } from "./app-fixed-action-area";

describe("AppFixedActionArea", () => {
  it("操作を画面下部に固定して表示する", () => {
    render(
      <AppFixedActionArea>
        <button type="button">保存</button>
      </AppFixedActionArea>,
    );

    expect(screen.getByRole("button", { name: "保存" }).parentElement).toHaveClass(
      "fixed",
      "bottom-0",
      "max-w-[430px]",
    );
  });
});
