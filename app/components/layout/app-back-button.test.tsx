import { fireEvent, render, screen } from "@testing-library/react";

import { AppBackButton } from "./app-back-button";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("react-router", () => ({
  useNavigate: () => navigate,
}));

describe("AppBackButton", () => {
  it("ひとつ前の履歴に戻る", () => {
    render(<AppBackButton />);

    fireEvent.click(screen.getByRole("button", { name: "戻る" }));

    expect(navigate).toHaveBeenCalledWith(-1);
  });
});
