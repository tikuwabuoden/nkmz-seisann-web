export function meta() {
  return [{ title: "ページが見つかりません | nkmz 精算" }];
}

export default function NotFound() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold">ページが見つかりません</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        指定されたページは存在しないか、移動した可能性があります。
      </p>
    </main>
  );
}
