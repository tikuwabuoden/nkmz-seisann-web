import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

import { AppFixedActionArea } from "@/components/layout/app-fixed-action-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { groupClient } from "@/features/groups/group-client";
import { getApiErrorMessage } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export function meta() {
  return [{ title: "精算グループを作成 | nkmz" }];
}

export default function GroupCreate() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createGroup = useMutation({
    mutationFn: () => groupClient.create({ name: name.trim() }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      navigate("/groups");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createGroup.mutate();
  }

  return (
    <main className="p-4 pb-24">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">精算グループを作成</h1>
      <form className="space-y-2" id="group-create-form" onSubmit={handleSubmit}>
        <label className="text-lg font-medium" htmlFor="group-name">
          グループ名
        </label>
        <Input
          aria-describedby="group-name-description"
          id="group-name"
          name="groupName"
          onChange={(event) => setName(event.target.value)}
          placeholder="例: 夏合宿 2026"
          value={name}
        />
        <p className="text-sm text-muted-foreground" id="group-name-description">
          作成者は最初の参加者になります
        </p>
      </form>
      {createGroup.isError ? <p className="mt-2 text-sm text-destructive" role="alert">{getApiErrorMessage(createGroup.error)}</p> : null}
      <AppFixedActionArea>
        <Button className="w-full" disabled={name.trim() === "" || createGroup.isPending} form="group-create-form" type="submit">
          作成する
        </Button>
      </AppFixedActionArea>
    </main>
  );
}
