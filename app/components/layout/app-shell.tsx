import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      className="mx-auto min-h-svh w-full max-w-[430px] bg-background sm:border-x"
      data-slot="app-shell"
    >
      {children}
    </div>
  );
}
