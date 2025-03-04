# My-GenAISrc

## 📚 프로젝트 소개

이 프로젝트는 Git 작업 흐름을 개선하기 위한 GenAI 스크립트 모음입니다. 인공지능을 활용하여 Git 커밋 메시지 생성 및 브랜치 차이점 설명과 같은 반복적인 작업을 자동화합니다.

## 🛠️ 기능

### 1. Git 커밋 메시지 생성기 (git_commit_message.genai.mjs)

✨ **기능**: 스테이징된 변경사항을 분석하여 컨벤셔널 커밋 형식의 커밋 메시지를 자동으로 생성합니다.

🔍 **주요 특징**:

- 컨벤셔널 커밋 형식 준수 (type(scope): message)
- 적절한 gitmoji 자동 선택
- 변경사항에 대한 요약 리스트 생성
- 한국어 메시지 지원
- 메시지 재생성 옵션

### 2. 브랜치 차이점 설명 생성기 (branch_diff_descriptor.genai.mjs)

📊 **기능**: 현재 브랜치와 기본 브랜치 간의 차이점을 분석하여 이해하기 쉬운 설명을 생성합니다.

🔍 **주요 특징**:

- 브랜치 간 차이점의 상위 수준 요약 제공
- 변경사항의 의도 파악
- 이모지를 활용한 직관적인 설명
- 중요 변경사항 중심의 요약

## 🚀 시작하기

### 필수 조건

- Node.js
- Git
- GenAI 스크립트 실행 환경

### 서브모듈로 설치하기

이 프로젝트를 서브모듈로 사용하면 기존 Git 저장소에 쉽게 통합할 수 있습니다.

1. 기존 프로젝트에 서브모듈로 추가:

   ```bash
   git submodule add https://github.com/sunyeul/my-genaisrc.git my_genaisrc
   git submodule update --init --recursive
   ```

2. 필요한 의존성 설치:

   ```bash
   cd my_genaisrc
   npm install genaiscript
   ```

3. 환경 설정:
   `.genaisrc/.env` 파일에 필요한 API 키와 설정을 추가합니다:

   ```plain
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

### 독립 저장소로 설치하기

별도의 독립 저장소로 사용하려면:

1. 저장소 클론:

   ```bash
   git clone https://github.com/sunyeul/my-genaisrc.git
   cd my-genaisrc
   ```

2. 필요한 의존성 설치:

   ```bash
   npm install genaiscript
   ```

3. 환경 설정:
   `.env` 파일에 필요한 API 키와 설정을 추가합니다.

## 📝 사용 방법

### 서브모듈로 사용하기

서브모듈로 설치한 경우:

```bash
# Git 커밋 메시지 생성기
npx genaiscript run git_commit_message

# 브랜치 차이점 설명 생성기
npx genaiscript run branch_diff_descriptor
```

### 독립 저장소로 사용하기

독립 저장소로 설치한 경우:

```bash
# Git 커밋 메시지 생성기
npx genaiscript run git_commit_message

# 브랜치 차이점 설명 생성기
npx genaiscript run branch_diff_descriptor
```

### 단축 명령어 설정하기

`package.json`에 스크립트를 추가하여 더 쉽게 사용할 수 있습니다:

```json
{
  "scripts": {
    "commit-msg": "genaiscript run git_commit_message",
    "branch-diff": "genaiscript run branch_diff_descriptor"
  }
}
```

그런 다음 다음과 같이 사용할 수 있습니다:

```bash
npm run commit-msg
npm run branch-diff
```

## 🤝 기여하기

1. 이 저장소를 포크합니다.
2. 새 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`).
3. 변경사항을 커밋합니다 (`git commit -m '✨ feat: 놀라운 기능 추가'`).
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`).
5. Pull Request를 생성합니다.
