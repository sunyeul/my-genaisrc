script({
    title: "git commit message",
    description: "ステージングされた変更のコミットメッセージを生成",
    group: "git",
})

// ステージングされた変更をチェックし、なければ全ての変更をステージング
const diff = await git.diff({
    staged: true,
    askStageOnEmpty: true,
})

// ステージングされた変更がない場合、スクリプトをキャンセル
if (!diff) cancel("ステージングされた変更がありません")

let choice
let message
do {
    // 改善されたプロンプト構成
    const res = await runPrompt(
        (_) => {
            _.def("GIT_DIFF", diff, {
                maxTokens: 10000,
                language: "diff",
                detectPromptInjection: "available",
            })
            _.$`変更内容を分析し、Git コンベンショナルコミットメッセージを日本語で生成してください：

                1. 以下の形式に正確に従ってください：
                    :gitmoji: <type>(<scope>): <日本語メッセージ>
                    
                    - 変更内容の要約1
                    - 変更内容の要約2
                    - 変更内容の要約3
                
                2. typeは以下のいずれかを使用してください：
                    - feat: 新機能
                    - fix: バグ修正
                    - docs: ドキュメント変更
                    - style: コードスタイル変更（フォーマットなど）
                    - refactor: リファクタリング
                    - perf: パフォーマンス改善
                    - test: テスト追加/修正
                    - build: ビルドシステム変更
                    - ci: CI設定変更
                    - chore: その他の変更
                    - revert: 以前のコミットを元に戻す
                
                3. scopeはオプションですが、あると良いです（変更されたコンポーネント/モジュール）
                
                4. メッセージは50文字以内で命令形現在形で作成してください（日本語で）
                
                5. 改行後は、変更内容を3-5個の簡潔なリスト項目で要約してください。
                   各項目は変更内容を明確に説明する必要があります。
                
                6. 適切なgitmojiを使用してください（例：✨ - 新機能、🐛 - バグ修正）
                主なgitmojiリスト：
                    - ✨ :sparkles: - 新機能
                    - 🐛 :bug: - バグ修正
                    - 📝 :memo: - ドキュメント変更
                    - 🎨 :art: - コード構造/フォーマット改善
                    - ♻️ :recycle: - コードリファクタリング
                    - ⚡️ :zap: - パフォーマンス改善
                    - ✅ :white_check_mark: - テスト追加/修正
                    - 🔧 :wrench: - 設定ファイル変更
                    - 🚀 :rocket: - デプロイ関連の変更
                    
                例： 
                ":sparkles: feat(auth): ユーザー認証エンドポイントを追加
                
                - JWT認証ロジックを実装
                - ユーザーログインエンドポイントを作成
                - トークン更新機能を追加
                - 認証ミドルウェアを設定"
                
                誤った例："ログインバグを修正"（形式エラー、コロンなし、現在形でない）
                
                GIT_DIFFを分析し、最も適切な日本語のコミットメッセージを提供してください。
                応答はコミットメッセージのみを正確に出力してください。
            `
        },
        {
            model: "openai:gpt-4o-mini",
            temperature: 0.3,
            label: "コミットメッセージ生成",
            system: [
                "system.assistant",
                "system.safety_jailbreak",
                "system.safety_harmful_content",
                "system.safety_validate_harmful_content",
            ],
        }
    )

    message = res.text?.trim()
    if (!message) {
        console.error("メッセージが生成されませんでした。再試行します...")
        choice = "regenerate"
        continue
    }

    // コミットメッセージ処理ロジックの統合
    choice = await host.select(message, [
        { value: "commit", description: "メッセージを承認してコミット" },
        { value: "regenerate", description: "メッセージを再生成" },
    ])

    if (choice === "regenerate") {
        continue
    }

    // コミットとプッシュの処理
    if ((choice === "commit") && message) {
        try {
            console.log(await git.exec(["commit", "-m", message]))
            console.log("✅ コミット完了")
            break
        } catch (error) {
            console.error("❌ コミット中にエラーが発生しました:", error.message)
            const retry = await host.confirm("再試行しますか？", { default: true })
            if (!retry) break
            continue
        }
    }
} while (choice === "regenerate")