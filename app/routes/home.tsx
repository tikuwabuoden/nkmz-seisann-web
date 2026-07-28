import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function meta() {
  return [
    { title: "nkmz 精算" },
    { name: "description", content: "共同立替の精算を記録するアプリ" },
  ];
}

export default function Home() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-[430px] bg-background px-4 py-6 sm:border-x">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">nkmz 精算</h1>
          <p className="text-sm text-muted-foreground">共通 UI コンポーネントの確認画面</p>
        </header>

        <Tabs defaultValue="payments">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payments">支払い</TabsTrigger>
            <TabsTrigger value="members">参加者</TabsTrigger>
          </TabsList>
          <TabsContent value="payments" className="space-y-4 pt-2">
            <div className="flex gap-2">
              <Input aria-label="費目" placeholder="例: 新幹線" />
              <Dialog>
                <DialogTrigger asChild>
                  <Button>追加</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>費目を追加</DialogTitle>
                    <DialogDescription>入力画面は次の Issue で実装します。</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button type="button">閉じる</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>内容</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>サンプルの支払い</TableCell>
                  <TableCell className="text-right tabular-nums">1,200 円</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="members" className="pt-4 text-sm text-muted-foreground">
            参加者管理は次の画面実装で追加します。
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
