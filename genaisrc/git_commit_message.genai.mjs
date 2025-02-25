script({
    title: "git commit message",
    description: "Generate a commit message for all staged changes",
    group: "git",
})

// Check for staged changes and stage all changes if none are staged
const diff = await git.diff({
    staged: true,
    askStageOnEmpty: true,
})

// If no staged changes are found, cancel the script with a message
if (!diff) cancel("no staged changes")

// Display the diff of staged changes in the console
const showDiff = await host.select("Would you like to see the diff?", [
    { value: "Yes", description: "Show diff" },
    { value: "No", description: "Hide diff" },
])

if (showDiff === "Yes") {
    console.log(diff)
}

let choice
let message
do {
    // 개선된 프롬프트 구성
    const res = await runPrompt(
        (_) => {
            _.def("GIT_DIFF", diff, {
                maxTokens: 10000,
                language: "diff",
                detectPromptInjection: "available",
            })
            _.$`변경 내용을 분석하여 Git 컨벤셔널 커밋 메시지를 생성하세요:

                1. 다음 형식을 정확히 따라주세요:
                    :gitmoji: <type>(<scope>): <subject>
                
                2. type은 다음 중 하나여야 합니다:
                    - feat: 새로운 기능
                    - fix: 버그 수정
                    - docs: 문서 변경
                    - style: 코드 스타일 변경 (포맷팅 등)
                    - refactor: 리팩토링
                    - perf: 성능 개선
                    - test: 테스트 추가/수정
                    - build: 빌드 시스템 변경
                    - ci: CI 설정 변경
                    - chore: 기타 변경사항
                    - revert: 이전 커밋 되돌리기
                
                3. scope는 선택사항이지만 있으면 좋습니다 (변경된 컴포넌트/모듈)
                
                4. subject는 50자 이내로 명령형 현재 시제로 작성하세요
                
                5. 적절한 gitmoji를 사용하세요 (예: ✨ - 새 기능, 🐛 - 버그 수정)
                주요 gitmoji 목록:
                    - ✨ :sparkles: - 새 기능
                    - 🐛 :bug: - 버그 수정
                    - 📝 :memo: - 문서 변경
                    - 🎨 :art: - 코드 구조/포맷 개선
                    - ♻️ :recycle: - 코드 리팩토링
                    - ⚡️ :zap: - 성능 개선
                    - ✅ :white_check_mark: - 테스트 추가/수정
                    - 🔧 :wrench: - 설정 파일 변경
                    - 🚀 :rocket: - 배포 관련 변경
                    
                예시: ":sparkles: feat(auth): add user authentication endpoint"
                잘못된 예시: "Fixed login bug" (형식 오류, 콜론 없음, 현재형 아님)
                
                GIT_DIFF를 분석하여 가장 적합한 커밋 메시지를 제공하세요.
                응답은 커밋 메시지만 정확히 출력하세요.
            `
        },
        {
            model: "openai:gpt-4o-mini",
            temperature: 0.3,
            label: "커밋 메시지 생성",
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
        console.error("생성된 메시지가 없습니다. 재시도합니다...")
        choice = "regenerate"
        continue
    }

    // 커밋 메시지 형식 검증
    const conventionalCommitPattern = /^:[\w_+-]+: (feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-zA-Z0-9-_]+\))?: .+$/
    if (!conventionalCommitPattern.test(message)) {
        console.warn("⚠️ 생성된 메시지가 컨벤셔널 커밋 형식에 맞지 않습니다.")
        console.log("예상 형식: :gitmoji: type(scope): subject")
        console.log("현재 메시지:", message)

        const formatAction = await host.select("형식이 맞지 않습니다. 어떻게 진행하시겠습니까?", [
            { value: "continue", description: "현재 메시지로 계속 진행" },
            { value: "regenerate", description: "메시지 재생성" },
            { value: "edit", description: "메시지 직접 수정" }
        ])
        
        if (formatAction === "regenerate") {
            choice = "regenerate"
            continue
        } else if (formatAction === "edit") {
            message = await host.input("커밋 메시지 수정", {
                required: true,
            })
        }
    }

    // 커밋 메시지 처리 로직 통합
    choice = await host.select(message, [
        { value: "commit", description: "메시지 수락 및 커밋" },
        { value: "edit", description: "메시지 편집 후 커밋" },
        { value: "regenerate", description: "메시지 재생성" },
    ])

    if (choice === "regenerate") {
        continue
    }

    // 편집 옵션 처리
    if (choice === "edit") {
        message = await host.input("커밋 메시지 편집", {
            required: true,
        })
    }

    // 커밋 및 푸시 처리 (edit과 commit 모두 이 로직으로 처리)
    if ((choice === "commit" || choice === "edit") && message) {
        try {
            console.log(await git.exec(["commit", "-m", message]))
            console.log("✅ 커밋 완료")
            
            // 푸시 옵션 제공
            const pushOptions = await host.select("변경사항을 푸시하시겠습니까?", [
                { value: "push", description: "현재 브랜치로 푸시" },
                { value: "no", description: "푸시하지 않음" },
            ])
            
            if (pushOptions === "push") {
                try {
                    console.log(await git.exec("push"))
                    console.log("✅ 푸시 완료")
                } catch (error) {
                    console.error("❌ 푸시 중 오류 발생:", error.message)
                }
            }
            break // 작업 완료 후 루프 종료
        } catch (error) {
            console.error("❌ 커밋 중 오류 발생:", error.message)
            const retry = await host.confirm("다시 시도하시겠습니까?", { default: true })
            if (!retry) break
            continue // 재시도 선택 시 루프 계속
        }
    }
} while (choice === "regenerate")  // 재생성 시 루프 유지