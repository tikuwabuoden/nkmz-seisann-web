import { render, screen } from "@testing-library/react";

import { AppHeader } from "./app-header";

describe("AppHeader", () => {
  it("アプリケーション名を表示する", () => {
    render(<AppHeader />);

    expect(screen.getByRole("banner")).toHaveTextContent("nkmz 精算");
  });
});
