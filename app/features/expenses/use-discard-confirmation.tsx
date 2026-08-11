import { useCallback } from "react";
import { useBeforeUnload, useBlocker } from "react-router";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function useDiscardConfirmation(hasUnsavedChanges: boolean) {
  const blocker = useBlocker(hasUnsavedChanges);

  useBeforeUnload(
    useCallback(
      (event) => {
        if (!hasUnsavedChanges) return;
        event.preventDefault();
        event.returnValue = true;
      },
      [hasUnsavedChanges],
    ),
  );

  return (
    <Dialog onOpenChange={(open) => { if (!open && blocker.state === "blocked") blocker.reset(); }} open={blocker.state === "blocked"}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>変更を破棄しますか？</DialogTitle>
          <DialogDescription>保存していない変更は失われます。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => { if (blocker.state === "blocked") blocker.reset(); }} type="button" variant="outline">編集を続ける</Button>
          <Button onClick={() => { if (blocker.state === "blocked") blocker.proceed(); }} type="button" variant="destructive">破棄する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
