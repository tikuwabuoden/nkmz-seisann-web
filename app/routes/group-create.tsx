import { AppFixedActionArea } from "@/components/layout/app-fixed-action-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function meta() {
  return [{ title: "精算グループを作成 | nkmz" }];
}

export default function GroupCreate() {
  return (
    <main className="p-4 pb-24">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">精算グループを作成</h1>
      <div className="space-y-2">
        <label className="text-lg font-medium" htmlFor="group-name">
          グループ名
        </label>
        <Input aria-describedby="group-name-description" id="group-name" name="groupName" placeholder="例: 夏合宿 2026" />
        <p className="text-sm text-muted-foreground" id="group-name-description">
          作成者は最初の参加者になります
        </p>
      </div>
      <AppFixedActionArea>
        <Button className="w-full" type="button">
          作成する
        </Button>
      </AppFixedActionArea>
    </main>
  );
}
