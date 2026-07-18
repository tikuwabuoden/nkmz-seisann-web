# nkmz-seisann-web

旅行中の立替・費用分担・最終精算を分かりやすく扱うためのWebアプリです。

バックエンドの `nkmz` と連携し、旅行ごとの参加者・費目・負担割合を管理して、最終的な支払いを分かりやすく提示することを目指します。

## コミット規約

Conventional Commits に沿って、次の形式でコミットします。

```text
<type>: <変更内容>
```

- `feat`: 機能追加
- `fix`: 不具合修正
- `docs`: ドキュメントのみの変更
- `refactor`: 振る舞いを変えないリファクタリング
- `test`: テストの追加・変更
- `chore`: 設定・依存関係などの雑務

例: `feat: 旅行を作成する画面を追加`

## ブランチ・PR運用

- `main` は常に動作する状態を保ち、直接pushしない。
- 作業はGitHub Issueごとに作業ブランチを作る。
  - 機能追加: `feature/<issue番号>-<内容>`
  - バグ修正: `fix/<issue番号>-<内容>`
  - ドキュメント: `docs/<issue番号>-<内容>`
  - 雑務: `chore/<issue番号>-<内容>`
- 作業ブランチから `main` へPull Requestを作成する。
- Pull Requestのタイトルは、対応するGitHub Issueのタイトルと原則同じにする。
- Pull Requestは **Squash and merge** でマージする。作業中の複数コミットを1つにまとめ、PRタイトル（対応するIssueタイトル）を `main` に残る最終コミットメッセージとして使う。
- マージ後の作業ブランチは削除する。
