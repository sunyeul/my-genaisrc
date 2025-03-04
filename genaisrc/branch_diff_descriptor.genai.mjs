script({
    title: "ブランチ差分ディスクリプター",
    description: "git diffからブランチ差分の説明を生成",
    model: "anthropic:claude-3-7-sonnet-latest",
    system: [
        "system",
        "system.assistant",
        "system.safety_jailbreak",
        "system.safety_harmful_content",
        "system.safety_validate_harmful_content",
    ],
    cache: "bdd",
})

const branches = await git.listBranches()
const defaultBranch = await host.select("デフォルトブランチを選択", branches)

const branch = await git.branch()
if (branch === defaultBranch) cancel("すでにデフォルトブランチにいます")

const branch_diff = await git.diff({
    base: defaultBranch,
})

// 変更がない場合、スクリプトをキャンセルしてメッセージを表示
if (!branch_diff) cancel("変更なし")

def("BRANCH_DIFF", branch_diff, {
    language: "diff",
    maxTokens: 20000,
})

// タスク
$`## タスク

BRANCH_DIFFの変更内容について、ソフトウェアエンジニアが理解できるような高レベルの要約を説明してください。
この説明はブランチ差分の説明として使用されます。

## ガイドライン

- BRANCH_DIFFがコードベースの変更を示していることを説明しないでください
- 変更の詳細よりも意図を抽出するよう努めてください
- 変更をリストアップする際は箇条書きを使用してください
- 説明をより魅力的にするために絵文字を使用してください
- 最も重要な変更に焦点を当ててください
- インポートに関するコメント（追加、削除、変更など）は無視してください
`
