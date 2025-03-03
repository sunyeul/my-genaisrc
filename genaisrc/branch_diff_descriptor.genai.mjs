script({
    title: "Branch Diff Descriptor",
    description: "Generate a branch diff description from the git diff",
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
const defaultBranch = await host.select("기본 브랜치 선택", branches)

const branch = await git.branch()
if (branch === defaultBranch) cancel("이미 기본 브랜치에 있습니다")

const branch_diff = await git.diff({
    base: defaultBranch,
})

// 변경사항이 없으면 스크립트를 취소하고 메시지 표시
if (!branch_diff) cancel("변경사항 없음")

def("BRANCH_DIFF", branch_diff, {
    language: "diff",
    maxTokens: 20000,
})

// 작업
$`## 작업

BRANCH_DIFF의 변경사항에 대한 상위 수준 요약을 소프트웨어 엔지니어가 이해할 수 있는 방식으로 설명하세요.
이 설명은 브랜치 차이의 설명으로 사용됩니다.

## 지침

- BRANCH_DIFF가 코드베이스의 변경사항을 보여준다고 설명하지 마세요
- 변경사항의 세부 사항보다는 의도를 추출하려고 노력하세요
- 변경사항을 나열할 때 글머리 기호를 사용하세요
- 설명을 더 흥미롭게 만들기 위해 이모지를 사용하세요
- 가장 중요한 변경사항에 집중하세요
- 임포트에 관한 주석(추가, 제거, 변경 등)은 무시하세요
`
