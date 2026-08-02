import type { ReactNode } from "react";

interface AppFixedActionAreaProps {
  children: ReactNode;
}

export function AppFixedActionArea({ children }: AppFixedActionAreaProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[430px] gap-2 border-t bg-background p-4 sm:border-x"
      data-slot="app-fixed-action-area"
    >
      {children}
    </div>
  );
}
