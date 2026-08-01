import { useLocation } from "react-router";

import { AppBackButton } from "./app-back-button";

export function AppHeader() {
  const { pathname } = useLocation();

  return (
    <header className="relative flex min-h-12 items-center justify-center border-b px-4">
      {pathname !== "/" ? <AppBackButton className="absolute left-0" /> : null}
      <p className="text-sm font-semibold">nkmz 精算</p>
    </header>
  );
}
