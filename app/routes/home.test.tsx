import { render, screen } from "@testing-library/react";

import Home from "./home";

describe("Home", () => {
  it("renders the application title", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "nkmz 精算" })).toBeInTheDocument();
  });
});
