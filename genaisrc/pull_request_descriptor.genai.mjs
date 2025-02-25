script({
    title: "Pull Request Descriptor",
    description: "Generate a pull request description from the git diff",
    model: "openai:gpt-4o-mini",
    system: [
        "system",
        "system.assistant",
        "system.safety_jailbreak",
        "system.safety_harmful_content",
        "system.safety_validate_harmful_content",
    ],
})

const { stdout: changes } = await host.exec("git", [
    "diff",
    "main",
    "--",
    ":!**/genaiscript.d.ts",
    ":!**/jsconfig.json",
    ":!genaisrc/*",
    ":!.github/*",
    ":!.vscode/*",
    ":!*yarn.lock",
])

def("GIT_DIFF", changes, {
    language: "diff",
    maxTokens: 20000,
})

// task
$`## Task

Describe a high level summary of the changes in GIT_DIFF in a way that a software engineer will understand.
This description will be used as the pull request description.

## Instructions

- do NOT explain that GIT_DIFF displays changes in the codebase
- try to extract the intent of the changes, don't focus on the details
- use bullet points to list the changes
- use emojis to make the description more engaging
- focus on the most important changes
- ignore comments about imports (like added, remove, changed, etc.)
`

