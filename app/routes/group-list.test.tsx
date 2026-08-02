import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import GroupList from "./group-list";

describe("精算グループ一覧画面", () => {
  it("グループ名、参加者数、費目数を表示する", () => {
    render(
      <MemoryRouter>
        <GroupList />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "精算グループ" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "夏合宿 2026" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "4人" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "3件" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "春の飲み会" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "6人" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "5件" })).toBeInTheDocument();
  });

  it("各グループの詳細画面へ遷移するリンクを表示する", () => {
    render(
      <MemoryRouter>
        <GroupList />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "夏合宿 2026の詳細を開く" })).toHaveAttribute(
      "href",
      "/groups/group-summer-camp-2026",
    );
    expect(screen.getByRole("link", { name: "春の飲み会の詳細を開く" })).toHaveAttribute(
      "href",
      "/groups/group-spring-drinking-party",
    );
  });
});
