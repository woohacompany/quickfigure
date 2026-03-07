import type { Locale } from "./dictionaries";

export type BlogCategory = "text-tools" | "developer-tools" | "generators" | "finance" | "lifestyle";

export interface ContentBlock {
  type: "paragraph" | "heading" | "code" | "list" | "callout" | "cta" | "faq";
  text?: string;
  items?: string[];
  language?: string;
  code?: string;
  tool?: string;
  toolName?: string;
  faqItems?: { question: string; answer: string }[];
}

export interface BlogPost {
  slug: string;
  category: BlogCategory;
  date: string;
  readingTime: number;
  thumbnailAlt: { en: string; ko: string };
  translations: {
    en: { title: string; summary: string; content: ContentBlock[] };
    ko: { title: string; summary: string; content: ContentBlock[] };
  };
  relatedTools: { slug: string; name: { en: string; ko: string } }[];
  relatedPosts: string[];
}

export const categoryLabels: Record<BlogCategory, { en: string; ko: string }> = {
  "text-tools": { en: "Text Tools", ko: "텍스트 도구" },
  "developer-tools": { en: "Developer Tools", ko: "개발자 도구" },
  generators: { en: "Generators", ko: "생성 도구" },
  finance: { en: "Finance", ko: "금융" },
  lifestyle: { en: "Lifestyle", ko: "라이프스타일" },
};

export const POSTS_PER_PAGE = 6;

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-count-words-in-essay",
    category: "text-tools",
    date: "2026-03-05",
    readingTime: 5,
    thumbnailAlt: {
      en: "A person typing an essay on a laptop with a word count display",
      ko: "노트북에서 에세이를 작성하며 글자수를 확인하는 모습",
    },
    translations: {
      en: {
        title: "How to Count Words in Your Essay Accurately",
        summary:
          "Learn the best methods for counting words in essays, research papers, and academic writing. Plus tips for meeting word count requirements.",
        content: [
          { type: "paragraph", text: "Whether you're writing a college essay, a research paper, or a blog post, knowing your word count is essential. Most academic assignments come with strict word count requirements, and exceeding or falling short can affect your grade." },
          { type: "heading", text: "Why Word Count Matters" },
          { type: "paragraph", text: "Word counts serve as a guideline for the depth and scope of your writing. A 500-word essay demands concise, focused arguments, while a 3,000-word paper allows for comprehensive analysis. Understanding these expectations helps you plan your writing effectively." },
          { type: "list", items: [
            "Academic submissions often have strict limits (e.g., 250-word abstracts)",
            "Blog posts perform best between 1,500-2,500 words for SEO",
            "Professional emails should stay under 200 words for readability",
            "Social media posts have platform-specific character limits",
          ] },
          { type: "cta", tool: "word-counter", toolName: "Word Counter" },
          { type: "heading", text: "Methods for Counting Words" },
          { type: "paragraph", text: "There are several ways to count words in your text. Word processors like Microsoft Word and Google Docs have built-in word counters. However, if you're writing in a plain text editor or need a quick count, online tools are the fastest option." },
          { type: "callout", text: "Key Takeaway: Online word counters give you more than just word count — they also show characters, sentences, paragraphs, and estimated reading time, helping you optimize your content for both academic and online audiences." },
          { type: "heading", text: "Tips for Meeting Word Count Requirements" },
          { type: "list", items: [
            "Outline your essay first — allocate word counts to each section",
            "Don't pad your writing with filler words; instead, add depth to your arguments",
            "Use specific examples and evidence to naturally increase word count",
            "Read your essay aloud to identify areas that could be expanded or trimmed",
            "Check word count regularly as you write, not just at the end",
          ] },
          { type: "heading", text: "What Counts as a 'Word'?" },
          { type: "paragraph", text: "Different tools may count words slightly differently. Generally, a word is any sequence of characters separated by whitespace. Hyphenated words (like 'well-known') may count as one or two words depending on the tool. Numbers, abbreviations, and acronyms each typically count as one word." },
          { type: "paragraph", text: "For academic purposes, most institutions follow standard word processing software counts. When in doubt, use the same tool your institution recommends, or use our Word Counter tool which follows standard counting conventions." },
          { type: "callout", text: "Pro Tip: When writing for the web, also pay attention to character count. Meta descriptions should be 150-160 characters, and title tags should stay under 60 characters for optimal SEO." },
        ],
      },
      ko: {
        title: "에세이 글자수를 정확하게 세는 방법",
        summary:
          "에세이, 연구 논문, 학술 글의 글자수를 정확하게 세는 방법과 글자수 요구사항을 충족하는 팁을 알아보세요.",
        content: [
          { type: "paragraph", text: "대학 에세이, 연구 논문, 블로그 글을 작성할 때 글자수를 파악하는 것은 필수입니다. 대부분의 학술 과제에는 엄격한 글자수 요구사항이 있으며, 초과하거나 부족하면 성적에 영향을 줄 수 있습니다." },
          { type: "heading", text: "글자수가 중요한 이유" },
          { type: "paragraph", text: "글자수는 글의 깊이와 범위에 대한 가이드라인입니다. 500자 에세이는 간결하고 집중된 논증을 요구하고, 3,000자 논문은 포괄적인 분석을 허용합니다. 이러한 기대를 이해하면 글쓰기를 효과적으로 계획할 수 있습니다." },
          { type: "list", items: [
            "학술 제출물에는 엄격한 제한이 있습니다 (예: 250자 초록)",
            "블로그 글은 SEO를 위해 1,500-2,500자가 최적입니다",
            "전문 이메일은 가독성을 위해 200자 이하가 좋습니다",
            "소셜 미디어 게시물은 플랫폼별 글자수 제한이 있습니다",
          ] },
          { type: "cta", tool: "word-counter", toolName: "글자수 세기" },
          { type: "heading", text: "글자수를 세는 방법" },
          { type: "paragraph", text: "텍스트의 글자수를 세는 방법은 여러 가지가 있습니다. Microsoft Word와 Google Docs 같은 워드 프로세서에는 내장 글자수 카운터가 있습니다. 하지만 일반 텍스트 편집기에서 작성하거나 빠른 확인이 필요한 경우, 온라인 도구가 가장 빠른 방법입니다." },
          { type: "callout", text: "핵심 포인트: 온라인 글자수 세기 도구는 단순한 글자수뿐만 아니라 단어, 문장, 문단 수와 예상 읽기 시간도 보여주어, 학술 및 온라인 콘텐츠 모두에 최적화할 수 있습니다." },
          { type: "heading", text: "글자수 요구사항 충족 팁" },
          { type: "list", items: [
            "먼저 개요를 작성하세요 — 각 섹션에 글자수를 배분하세요",
            "불필요한 단어로 채우지 말고, 논증에 깊이를 더하세요",
            "구체적인 예시와 증거를 사용하여 자연스럽게 글자수를 늘리세요",
            "에세이를 소리 내어 읽어 확장하거나 줄일 부분을 파악하세요",
            "마지막이 아닌 작성 중에 정기적으로 글자수를 확인하세요",
          ] },
          { type: "heading", text: "'단어'란 무엇인가?" },
          { type: "paragraph", text: "도구마다 단어를 약간 다르게 셀 수 있습니다. 일반적으로 단어는 공백으로 구분된 모든 문자 시퀀스입니다. 한국어의 경우 어절 단위로 계산되는 경우가 많으며, 글자수는 공백 포함/제외 여부에 따라 달라질 수 있습니다." },
          { type: "callout", text: "꿀팁: 웹용 글을 작성할 때는 글자수에도 주의하세요. 메타 설명은 150-160자, 제목 태그는 SEO 최적화를 위해 60자 이하로 유지하는 것이 좋습니다." },
        ],
      },
    },
    relatedTools: [
      { slug: "word-counter", name: { en: "Word Counter", ko: "글자수 세기" } },
      { slug: "case-converter", name: { en: "Case Converter", ko: "대소문자 변환" } },
    ],
    relatedPosts: ["text-case-conversion-guide", "lorem-ipsum-history-and-usage", "compound-interest-calculator-guide"],
  },
  {
    slug: "json-formatting-best-practices",
    category: "developer-tools",
    date: "2026-03-03",
    readingTime: 6,
    thumbnailAlt: {
      en: "Code editor showing formatted JSON data with syntax highlighting",
      ko: "구문 강조가 적용된 JSON 데이터가 표시된 코드 편집기",
    },
    translations: {
      en: {
        title: "JSON Formatting Best Practices for Developers",
        summary:
          "Master JSON formatting with these essential best practices. Learn about proper indentation, validation, common mistakes, and tools that make working with JSON easier.",
        content: [
          { type: "paragraph", text: "JSON (JavaScript Object Notation) has become the de facto standard for data exchange on the web. Whether you're building REST APIs, configuring applications, or storing data, proper JSON formatting is crucial for maintainability and debugging." },
          { type: "heading", text: "Why Proper JSON Formatting Matters" },
          { type: "paragraph", text: "Minified JSON saves bandwidth but is nearly impossible to read. When debugging API responses or editing configuration files, well-formatted JSON can save you hours of work. Consistent formatting also makes version control diffs cleaner and code reviews easier." },
          { type: "cta", tool: "json-formatter", toolName: "JSON Formatter" },
          { type: "heading", text: "Essential JSON Formatting Rules" },
          { type: "list", items: [
            "Use 2-space indentation for readability (industry standard)",
            "Always use double quotes for keys and string values",
            "No trailing commas — JSON is strict about this, unlike JavaScript",
            "Use null instead of undefined (undefined is not valid JSON)",
            "Keep arrays of simple values on one line when short enough",
          ] },
          { type: "heading", text: "Common JSON Mistakes" },
          { type: "paragraph", text: "Even experienced developers make JSON syntax errors. Here are the most common ones:" },
          { type: "code", language: "json", code: "// WRONG - these will cause parse errors:\n{\n  name: \"John\",           // Keys must be quoted\n  \"age\": 30,\n  \"active\": true,\n  \"hobbies\": [\"reading\",], // Trailing comma\n}\n\n// CORRECT:\n{\n  \"name\": \"John\",\n  \"age\": 30,\n  \"active\": true,\n  \"hobbies\": [\"reading\"]\n}" },
          { type: "callout", text: "Key Takeaway: Always validate your JSON before using it in production. A single misplaced comma or unquoted key can break your entire application. Use a JSON formatter/validator to catch errors early." },
          { type: "heading", text: "JSON vs. Other Data Formats" },
          { type: "paragraph", text: "While JSON is the most popular format, YAML is often preferred for configuration files due to its readability, and Protocol Buffers excel in performance-critical applications. Choose the right format based on your use case: JSON for APIs and data exchange, YAML for configs, and binary formats for high-performance needs." },
          { type: "heading", text: "Formatting Large JSON Files" },
          { type: "paragraph", text: "When dealing with large JSON files (megabytes or more), desktop editors may struggle. Use command-line tools like jq for processing, or online formatters for quick formatting tasks. Our JSON Formatter handles large inputs efficiently right in your browser." },
        ],
      },
      ko: {
        title: "개발자를 위한 JSON 포맷팅 모범 사례",
        summary:
          "JSON 포맷팅의 필수 모범 사례를 마스터하세요. 올바른 들여쓰기, 유효성 검사, 흔한 실수, 유용한 도구에 대해 알아봅니다.",
        content: [
          { type: "paragraph", text: "JSON(JavaScript Object Notation)은 웹에서 데이터 교환의 사실상 표준이 되었습니다. REST API 구축, 애플리케이션 설정, 데이터 저장 등 어떤 작업이든 올바른 JSON 포맷팅은 유지보수와 디버깅에 매우 중요합니다." },
          { type: "heading", text: "올바른 JSON 포맷팅이 중요한 이유" },
          { type: "paragraph", text: "압축된 JSON은 대역폭을 절약하지만 읽기가 거의 불가능합니다. API 응답을 디버깅하거나 설정 파일을 편집할 때, 잘 정리된 JSON은 수 시간의 작업을 절약할 수 있습니다. 일관된 포맷팅은 버전 관리 diff를 깔끔하게 하고 코드 리뷰를 쉽게 만듭니다." },
          { type: "cta", tool: "json-formatter", toolName: "JSON 포맷터" },
          { type: "heading", text: "필수 JSON 포맷팅 규칙" },
          { type: "list", items: [
            "가독성을 위해 2칸 들여쓰기 사용 (업계 표준)",
            "키와 문자열 값에는 항상 큰따옴표 사용",
            "후행 쉼표 금지 — JavaScript와 달리 JSON은 이에 엄격합니다",
            "undefined 대신 null 사용 (undefined는 유효한 JSON이 아닙니다)",
            "짧은 단순 값 배열은 한 줄로 유지",
          ] },
          { type: "heading", text: "흔한 JSON 실수" },
          { type: "paragraph", text: "경험 많은 개발자도 JSON 구문 오류를 범합니다. 가장 흔한 실수들입니다:" },
          { type: "code", language: "json", code: "// 잘못된 예 - 파싱 오류 발생:\n{\n  name: \"John\",           // 키는 따옴표로 감싸야 합니다\n  \"age\": 30,\n  \"active\": true,\n  \"hobbies\": [\"reading\",], // 후행 쉼표\n}\n\n// 올바른 예:\n{\n  \"name\": \"John\",\n  \"age\": 30,\n  \"active\": true,\n  \"hobbies\": [\"reading\"]\n}" },
          { type: "callout", text: "핵심 포인트: 프로덕션에서 사용하기 전에 항상 JSON의 유효성을 검사하세요. 잘못된 쉼표 하나나 따옴표 없는 키가 전체 애플리케이션을 중단시킬 수 있습니다. JSON 포맷터/검증기를 사용하여 오류를 조기에 잡으세요." },
          { type: "heading", text: "JSON vs. 다른 데이터 형식" },
          { type: "paragraph", text: "JSON이 가장 인기 있는 형식이지만, YAML은 가독성 때문에 설정 파일에서 선호되고, Protocol Buffers는 성능이 중요한 애플리케이션에서 우수합니다. 사용 사례에 맞는 형식을 선택하세요: API와 데이터 교환에는 JSON, 설정에는 YAML, 고성능에는 바이너리 형식." },
          { type: "heading", text: "대용량 JSON 파일 포맷팅" },
          { type: "paragraph", text: "메가바이트 이상의 대용량 JSON 파일을 다룰 때 데스크톱 편집기가 어려움을 겪을 수 있습니다. 처리에는 jq 같은 명령줄 도구를 사용하거나, 빠른 포맷팅에는 온라인 포맷터를 활용하세요. QuickFigure의 JSON 포맷터는 브라우저에서 바로 대용량 입력을 효율적으로 처리합니다." },
        ],
      },
    },
    relatedTools: [
      { slug: "json-formatter", name: { en: "JSON Formatter", ko: "JSON 포맷터" } },
      { slug: "base64-encoder-decoder", name: { en: "Base64 Encoder/Decoder", ko: "Base64 인코더/디코더" } },
    ],
    relatedPosts: ["understanding-base64-encoding", "how-to-create-strong-passwords", "bmi-calculator-guide"],
  },
  {
    slug: "how-to-create-strong-passwords",
    category: "generators",
    date: "2026-03-01",
    readingTime: 5,
    thumbnailAlt: {
      en: "A secure password being generated with various character types displayed",
      ko: "다양한 문자 유형이 표시된 보안 비밀번호 생성 화면",
    },
    translations: {
      en: {
        title: "How to Create Strong Passwords That You Can Remember",
        summary:
          "Learn proven strategies for creating strong, memorable passwords. Understand what makes a password secure and how to manage multiple passwords safely.",
        content: [
          { type: "paragraph", text: "In an age where data breaches are increasingly common, having strong, unique passwords for every account is no longer optional — it's essential. But creating passwords that are both secure and memorable can feel like an impossible task." },
          { type: "heading", text: "What Makes a Password Strong?" },
          { type: "paragraph", text: "A strong password has several key characteristics that make it resistant to both brute-force attacks and social engineering:" },
          { type: "list", items: [
            "At least 12-16 characters long — longer is always better",
            "Mix of uppercase and lowercase letters",
            "Includes numbers and special characters",
            "Not based on personal information (birthdays, pet names, etc.)",
            "Not a common word or phrase found in dictionaries",
            "Unique for each account — never reuse passwords",
          ] },
          { type: "cta", tool: "password-generator", toolName: "Password Generator" },
          { type: "heading", text: "The Passphrase Method" },
          { type: "paragraph", text: "One of the best strategies for creating memorable yet strong passwords is the passphrase method. Instead of a single word, use a series of random words combined together:" },
          { type: "code", language: "text", code: "Weak:     password123\nBetter:   P@ssw0rd!2024\nStrong:   correct-horse-battery-staple\nStronger: Correct.Horse" },
          { type: "paragraph", text: "A four-word passphrase is typically more secure than a short complex password, and significantly easier to remember. The key is using truly random words, not a meaningful phrase." },
          { type: "callout", text: "Key Takeaway: Length beats complexity. A 20-character passphrase of random words is harder to crack than an 8-character password with special characters. Use a password generator for maximum randomness." },
          { type: "heading", text: "Managing Multiple Passwords" },
          { type: "paragraph", text: "The average person has over 100 online accounts. Remembering unique passwords for each one is practically impossible without help. This is where password managers come in — they generate, store, and auto-fill strong passwords so you only need to remember one master password." },
          { type: "heading", text: "Common Password Mistakes to Avoid" },
          { type: "list", items: [
            "Using the same password across multiple sites",
            "Making small variations of the same base password",
            "Writing passwords on sticky notes or unencrypted files",
            "Sharing passwords via email or messaging apps",
            "Not enabling two-factor authentication (2FA) when available",
          ] },
          { type: "paragraph", text: "Generate strong passwords instantly with our Password Generator tool. You can customize the length and character types to meet any requirement." },
        ],
      },
      ko: {
        title: "기억하기 쉬운 강력한 비밀번호 만드는 방법",
        summary:
          "강력하면서 기억하기 쉬운 비밀번호를 만드는 검증된 전략을 알아보세요. 비밀번호 보안의 핵심과 여러 비밀번호를 안전하게 관리하는 방법을 설명합니다.",
        content: [
          { type: "paragraph", text: "데이터 유출이 점점 더 빈번해지는 시대에, 모든 계정에 강력하고 고유한 비밀번호를 사용하는 것은 선택이 아닌 필수입니다. 하지만 안전하면서도 기억하기 쉬운 비밀번호를 만드는 것은 불가능한 과제처럼 느껴질 수 있습니다." },
          { type: "heading", text: "강력한 비밀번호의 조건" },
          { type: "paragraph", text: "강력한 비밀번호는 무차별 대입 공격과 사회 공학 공격 모두에 저항할 수 있는 여러 핵심 특성을 갖추고 있습니다:" },
          { type: "list", items: [
            "최소 12-16자 이상 — 길수록 좋습니다",
            "대문자와 소문자의 혼합",
            "숫자와 특수문자 포함",
            "개인정보에 기반하지 않음 (생일, 반려동물 이름 등)",
            "사전에 있는 일반 단어나 구문이 아닌 것",
            "각 계정마다 고유 — 비밀번호 재사용 금지",
          ] },
          { type: "cta", tool: "password-generator", toolName: "비밀번호 생성기" },
          { type: "heading", text: "패스프레이즈 방법" },
          { type: "paragraph", text: "기억하기 쉬우면서 강력한 비밀번호를 만드는 최고의 전략 중 하나는 패스프레이즈 방법입니다. 단일 단어 대신 여러 무작위 단어를 조합합니다:" },
          { type: "code", language: "text", code: "약함:     password123\n보통:     P@ssw0rd!2024\n강함:     correct-horse-battery-staple\n매우 강함: Correct.Horse$Battery9Staple" },
          { type: "paragraph", text: "네 단어로 된 패스프레이즈는 일반적으로 짧고 복잡한 비밀번호보다 더 안전하며, 기억하기도 훨씬 쉽습니다. 핵심은 의미 있는 구문이 아닌 진정으로 무작위한 단어를 사용하는 것입니다." },
          { type: "callout", text: "핵심 포인트: 길이가 복잡성보다 중요합니다. 무작위 단어로 구성된 20자 패스프레이즈는 특수문자가 포함된 8자 비밀번호보다 해독하기 어렵습니다. 최대한의 무작위성을 위해 비밀번호 생성기를 사용하세요." },
          { type: "heading", text: "여러 비밀번호 관리" },
          { type: "paragraph", text: "평균적인 사람은 100개 이상의 온라인 계정을 보유하고 있습니다. 도움 없이 각각에 대한 고유한 비밀번호를 기억하는 것은 사실상 불가능합니다. 비밀번호 관리자는 강력한 비밀번호를 생성, 저장, 자동 입력하여 하나의 마스터 비밀번호만 기억하면 됩니다." },
          { type: "heading", text: "피해야 할 흔한 비밀번호 실수" },
          { type: "list", items: [
            "여러 사이트에서 같은 비밀번호 사용",
            "같은 기본 비밀번호에 작은 변형만 추가",
            "포스트잇이나 암호화되지 않은 파일에 비밀번호 기록",
            "이메일이나 메시지 앱으로 비밀번호 공유",
            "이중 인증(2FA)이 가능할 때 활성화하지 않기",
          ] },
          { type: "paragraph", text: "비밀번호 생성기 도구로 강력한 비밀번호를 즉시 생성하세요. 길이와 문자 유형을 맞춤 설정하여 모든 요구사항을 충족할 수 있습니다." },
        ],
      },
    },
    relatedTools: [
      { slug: "password-generator", name: { en: "Password Generator", ko: "비밀번호 생성기" } },
      { slug: "base64-encoder-decoder", name: { en: "Base64 Encoder/Decoder", ko: "Base64 인코더/디코더" } },
    ],
    relatedPosts: ["understanding-base64-encoding", "json-formatting-best-practices", "retirement-savings-calculator-guide"],
  },
  {
    slug: "understanding-base64-encoding",
    category: "developer-tools",
    date: "2026-02-27",
    readingTime: 7,
    thumbnailAlt: {
      en: "Binary data being converted to Base64 text representation",
      ko: "이진 데이터가 Base64 텍스트 표현으로 변환되는 모습",
    },
    translations: {
      en: {
        title: "Understanding Base64 Encoding: A Beginner's Guide",
        summary:
          "Learn what Base64 encoding is, how it works, when to use it, and common pitfalls. A practical guide for developers working with data encoding.",
        content: [
          { type: "paragraph", text: "Base64 encoding is one of those fundamental concepts that every developer encounters but few fully understand. Whether you're embedding images in CSS, handling email attachments, or working with APIs, understanding Base64 is essential." },
          { type: "heading", text: "What Is Base64?" },
          { type: "paragraph", text: "Base64 is a binary-to-text encoding scheme that represents binary data as ASCII strings. It uses 64 characters (A-Z, a-z, 0-9, +, /) plus = for padding to represent any binary data in a text-safe format." },
          { type: "code", language: "text", code: "Original:  Hello, World!\nBase64:    SGVsbG8sIFdvcmxkIQ==\n\nOriginal:  {\"key\": \"value\"}\nBase64:    eyJrZXkiOiAidmFsdWUifQ==" },
          { type: "cta", tool: "base64-encoder-decoder", toolName: "Base64 Encoder/Decoder" },
          { type: "heading", text: "How Base64 Encoding Works" },
          { type: "paragraph", text: "The encoding process works by taking every 3 bytes (24 bits) of input and splitting them into 4 groups of 6 bits. Each 6-bit group maps to one of the 64 characters in the Base64 alphabet. If the input isn't divisible by 3, padding characters (=) are added." },
          { type: "list", items: [
            "Every 3 input bytes become 4 Base64 characters",
            "Output is always ~33% larger than the input",
            "The = padding ensures the output length is a multiple of 4",
            "Base64 is encoding, NOT encryption — it provides no security",
          ] },
          { type: "callout", text: "Key Takeaway: Base64 is NOT encryption! It's a reversible encoding that anyone can decode. Never use Base64 to protect sensitive data — use proper encryption instead." },
          { type: "heading", text: "Common Use Cases" },
          { type: "list", items: [
            "Data URIs — embedding images directly in HTML/CSS",
            "Email attachments (MIME encoding)",
            "Storing binary data in JSON or XML",
            "JWT (JSON Web Tokens) — header and payload are Base64-encoded",
            "Basic HTTP authentication headers",
            "Transferring files through text-only channels",
          ] },
          { type: "heading", text: "Base64 Variants" },
          { type: "paragraph", text: "Standard Base64 uses + and / characters, which can cause issues in URLs. URL-safe Base64 replaces these with - and _ respectively. When working with web applications, you'll often encounter both variants, so it's important to know which one your system expects." },
          { type: "heading", text: "Performance Considerations" },
          { type: "paragraph", text: "Since Base64 increases data size by approximately 33%, it's important to consider the performance impact. For small data like icons or simple images, the overhead is negligible and the benefit of reducing HTTP requests outweighs the size increase. For larger files, it's usually better to serve them as separate resources." },
        ],
      },
      ko: {
        title: "Base64 인코딩 이해하기: 초보자 가이드",
        summary:
          "Base64 인코딩이 무엇인지, 어떻게 작동하는지, 언제 사용해야 하는지, 흔한 실수는 무엇인지 알아보세요. 데이터 인코딩 작업을 하는 개발자를 위한 실용 가이드입니다.",
        content: [
          { type: "paragraph", text: "Base64 인코딩은 모든 개발자가 접하지만 완전히 이해하는 사람은 적은 기본 개념 중 하나입니다. CSS에 이미지를 삽입하거나, 이메일 첨부 파일을 처리하거나, API를 작업할 때 Base64 이해는 필수적입니다." },
          { type: "heading", text: "Base64란?" },
          { type: "paragraph", text: "Base64는 이진 데이터를 ASCII 문자열로 표현하는 이진-텍스트 인코딩 방식입니다. 64개의 문자(A-Z, a-z, 0-9, +, /)와 패딩용 =을 사용하여 모든 이진 데이터를 텍스트 안전 형식으로 나타냅니다." },
          { type: "code", language: "text", code: "원본:    Hello, World!\nBase64:  SGVsbG8sIFdvcmxkIQ==\n\n원본:    {\"key\": \"value\"}\nBase64:  eyJrZXkiOiAidmFsdWUifQ==" },
          { type: "cta", tool: "base64-encoder-decoder", toolName: "Base64 인코더/디코더" },
          { type: "heading", text: "Base64 인코딩의 작동 원리" },
          { type: "paragraph", text: "인코딩 과정은 입력의 3바이트(24비트)를 가져와 6비트씩 4그룹으로 나눕니다. 각 6비트 그룹은 Base64 알파벳의 64개 문자 중 하나에 매핑됩니다. 입력이 3으로 나누어지지 않으면 패딩 문자(=)가 추가됩니다." },
          { type: "list", items: [
            "입력 3바이트가 Base64 문자 4개가 됩니다",
            "출력은 항상 입력보다 약 33% 더 큽니다",
            "= 패딩은 출력 길이가 4의 배수가 되도록 합니다",
            "Base64는 인코딩이지 암호화가 아닙니다 — 보안을 제공하지 않습니다",
          ] },
          { type: "callout", text: "핵심 포인트: Base64는 암호화가 아닙니다! 누구나 디코딩할 수 있는 가역적 인코딩입니다. 민감한 데이터를 보호하기 위해 Base64를 사용하지 마세요 — 대신 적절한 암호화를 사용하세요." },
          { type: "heading", text: "일반적인 사용 사례" },
          { type: "list", items: [
            "Data URI — HTML/CSS에 이미지 직접 삽입",
            "이메일 첨부 파일 (MIME 인코딩)",
            "JSON이나 XML에 바이너리 데이터 저장",
            "JWT (JSON Web Token) — 헤더와 페이로드가 Base64로 인코딩",
            "HTTP 기본 인증 헤더",
            "텍스트 전용 채널을 통한 파일 전송",
          ] },
          { type: "heading", text: "Base64 변형" },
          { type: "paragraph", text: "표준 Base64는 +와 / 문자를 사용하는데, URL에서 문제를 일으킬 수 있습니다. URL 안전 Base64는 이를 각각 -와 _로 대체합니다. 웹 애플리케이션에서 두 변형을 모두 만날 수 있으므로, 시스템이 어떤 것을 기대하는지 아는 것이 중요합니다." },
          { type: "heading", text: "성능 고려사항" },
          { type: "paragraph", text: "Base64는 데이터 크기를 약 33% 증가시키므로 성능 영향을 고려해야 합니다. 아이콘이나 간단한 이미지 같은 작은 데이터의 경우 오버헤드는 무시할 수 있으며 HTTP 요청 감소의 이점이 크기 증가보다 큽니다. 더 큰 파일의 경우 일반적으로 별도 리소스로 제공하는 것이 좋습니다." },
        ],
      },
    },
    relatedTools: [
      { slug: "base64-encoder-decoder", name: { en: "Base64 Encoder/Decoder", ko: "Base64 인코더/디코더" } },
      { slug: "json-formatter", name: { en: "JSON Formatter", ko: "JSON 포맷터" } },
    ],
    relatedPosts: ["json-formatting-best-practices", "how-to-create-strong-passwords"],
  },
  {
    slug: "text-case-conversion-guide",
    category: "text-tools",
    date: "2026-02-24",
    readingTime: 4,
    thumbnailAlt: {
      en: "Text being converted between different case formats like camelCase and snake_case",
      ko: "camelCase와 snake_case 같은 다양한 형식 간에 텍스트가 변환되는 모습",
    },
    translations: {
      en: {
        title: "Text Case Conversion: When and Why to Use Different Cases",
        summary:
          "A practical guide to text case conventions. Learn when to use camelCase, snake_case, PascalCase, and other formats in programming and writing.",
        content: [
          { type: "paragraph", text: "Text case conventions might seem like a minor detail, but they play a crucial role in code readability, consistency, and even functionality. Using the wrong case can lead to bugs, inconsistent APIs, and confused team members." },
          { type: "heading", text: "Common Case Formats Explained" },
          { type: "code", language: "text", code: "camelCase    → firstName (JavaScript, Java variables)\nPascalCase   → FirstName (C# classes, React components)\nsnake_case   → first_name (Python, Ruby, database columns)\nkebab-case   → first-name (CSS classes, URL slugs)\nUPPER_CASE   → FIRST_NAME (constants, environment variables)\nTitle Case   → First Name (headings, titles)" },
          { type: "cta", tool: "case-converter", toolName: "Case Converter" },
          { type: "heading", text: "Case Conventions by Language" },
          { type: "paragraph", text: "Every programming language has established conventions for naming. Following these conventions makes your code more readable and consistent with the ecosystem:" },
          { type: "list", items: [
            "JavaScript/TypeScript: camelCase for variables and functions, PascalCase for classes and components",
            "Python: snake_case for variables and functions, PascalCase for classes",
            "CSS: kebab-case for class names and properties",
            "SQL: snake_case for table and column names, UPPER_CASE for keywords",
            "REST APIs: camelCase or snake_case (pick one and be consistent)",
            "Environment variables: UPPER_SNAKE_CASE",
          ] },
          { type: "callout", text: "Key Takeaway: Consistency is more important than which convention you choose. Pick one naming convention per context and stick with it throughout your project." },
          { type: "heading", text: "Converting Between Cases in Practice" },
          { type: "paragraph", text: "You'll often need to convert between cases when working across different systems. For example, a JavaScript frontend might use camelCase while the Python backend uses snake_case. API serialization layers typically handle this conversion automatically, but for manual conversions, use our Case Converter tool." },
          { type: "heading", text: "SEO and Title Case" },
          { type: "paragraph", text: "For web content, Title Case is commonly used for headings and page titles. It improves readability and looks more professional. However, Sentence case is becoming more popular in modern UI design as it feels more natural and approachable. Major companies like Google and Apple have shifted to Sentence case in their interfaces." },
        ],
      },
      ko: {
        title: "텍스트 대소문자 변환: 각 형식을 언제, 왜 사용하는가",
        summary:
          "텍스트 대소문자 규칙에 대한 실용 가이드. 프로그래밍과 글쓰기에서 camelCase, snake_case, PascalCase 등의 형식을 언제 사용해야 하는지 알아보세요.",
        content: [
          { type: "paragraph", text: "텍스트 대소문자 규칙은 사소한 세부사항처럼 보일 수 있지만, 코드 가독성, 일관성, 심지어 기능성에서도 중요한 역할을 합니다. 잘못된 대소문자 사용은 버그, 일관성 없는 API, 혼란스러운 팀원을 초래할 수 있습니다." },
          { type: "heading", text: "일반적인 대소문자 형식 설명" },
          { type: "code", language: "text", code: "camelCase    → firstName (JavaScript, Java 변수)\nPascalCase   → FirstName (C# 클래스, React 컴포넌트)\nsnake_case   → first_name (Python, Ruby, DB 컬럼)\nkebab-case   → first-name (CSS 클래스, URL 슬러그)\nUPPER_CASE   → FIRST_NAME (상수, 환경 변수)\nTitle Case   → First Name (제목, 타이틀)" },
          { type: "cta", tool: "case-converter", toolName: "대소문자 변환" },
          { type: "heading", text: "언어별 대소문자 규칙" },
          { type: "paragraph", text: "모든 프로그래밍 언어에는 네이밍에 대한 확립된 규칙이 있습니다. 이러한 규칙을 따르면 코드가 더 읽기 쉽고 생태계와 일관성을 유지합니다:" },
          { type: "list", items: [
            "JavaScript/TypeScript: 변수와 함수에 camelCase, 클래스와 컴포넌트에 PascalCase",
            "Python: 변수와 함수에 snake_case, 클래스에 PascalCase",
            "CSS: 클래스명과 속성에 kebab-case",
            "SQL: 테이블과 컬럼명에 snake_case, 키워드에 UPPER_CASE",
            "REST API: camelCase 또는 snake_case (하나를 선택하고 일관되게)",
            "환경 변수: UPPER_SNAKE_CASE",
          ] },
          { type: "callout", text: "핵심 포인트: 어떤 규칙을 선택하느냐보다 일관성이 더 중요합니다. 컨텍스트별로 하나의 네이밍 규칙을 선택하고 프로젝트 전체에서 일관되게 사용하세요." },
          { type: "heading", text: "실제 대소문자 변환" },
          { type: "paragraph", text: "서로 다른 시스템 간에 작업할 때 대소문자 변환이 자주 필요합니다. 예를 들어, JavaScript 프론트엔드는 camelCase를 사용하고 Python 백엔드는 snake_case를 사용할 수 있습니다. API 직렬화 레이어가 일반적으로 이 변환을 자동 처리하지만, 수동 변환에는 대소문자 변환 도구를 사용하세요." },
          { type: "heading", text: "SEO와 Title Case" },
          { type: "paragraph", text: "웹 콘텐츠에서 Title Case는 제목과 페이지 타이틀에 일반적으로 사용됩니다. 가독성을 높이고 전문적으로 보입니다. 하지만 현대 UI 디자인에서는 더 자연스럽고 친근한 느낌의 Sentence case가 점점 인기를 얻고 있습니다. Google과 Apple 같은 대형 기업들도 인터페이스에서 Sentence case로 전환했습니다." },
        ],
      },
    },
    relatedTools: [
      { slug: "case-converter", name: { en: "Case Converter", ko: "대소문자 변환" } },
      { slug: "word-counter", name: { en: "Word Counter", ko: "글자수 세기" } },
    ],
    relatedPosts: ["how-to-count-words-in-essay", "lorem-ipsum-history-and-usage"],
  },
  {
    slug: "compound-interest-calculator-guide",
    category: "finance",
    date: "2026-02-20",
    readingTime: 8,
    thumbnailAlt: {
      en: "Graph showing compound interest growth over time with an upward curve",
      ko: "시간에 따른 복리 이자 성장을 보여주는 상승 곡선 그래프",
    },
    translations: {
      en: {
        title: "How to Calculate Compound Interest: Formula, Examples, and Calculator",
        summary:
          "Master compound interest calculations with clear formulas, real-world examples, and practical tips for growing your savings and investments.",
        content: [
          { type: "paragraph", text: "Compound interest is often called the eighth wonder of the world, and for good reason. It's the mechanism that turns small, regular savings into significant wealth over time. Understanding how compound interest works is fundamental to making smart financial decisions." },
          { type: "heading", text: "What Is Compound Interest?" },
          { type: "paragraph", text: "Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. Unlike simple interest, which only earns interest on the original amount, compound interest earns interest on interest — creating an exponential growth effect." },
          { type: "heading", text: "The Compound Interest Formula" },
          { type: "code", language: "text", code: "A = P(1 + r/n)^(nt)\n\nWhere:\n  A = Final amount\n  P = Principal (initial investment)\n  r = Annual interest rate (decimal)\n  n = Number of times interest compounds per year\n  t = Number of years\n\nExample:\n  P = $10,000\n  r = 5% (0.05)\n  n = 12 (monthly compounding)\n  t = 10 years\n\n  A = 10,000(1 + 0.05/12)^(12 × 10)\n  A = 10,000(1.004167)^120\n  A = $16,470.09\n\n  Interest earned: $6,470.09" },
          { type: "callout", text: "Key Takeaway: In this example, you earned $6,470.09 in interest on a $10,000 investment over 10 years at 5% — without adding any additional money. The power of compound interest grows dramatically over longer time periods." },
          { type: "heading", text: "Compounding Frequency Matters" },
          { type: "paragraph", text: "The more frequently interest compounds, the more you earn. Here's how different compounding frequencies affect a $10,000 investment at 5% over 10 years:" },
          { type: "list", items: [
            "Annually (1x/year): $16,288.95",
            "Quarterly (4x/year): $16,436.19",
            "Monthly (12x/year): $16,470.09",
            "Daily (365x/year): $16,486.65",
            "Continuously: $16,487.21",
          ] },
          { type: "heading", text: "Rule of 72" },
          { type: "paragraph", text: "The Rule of 72 is a quick way to estimate how long it takes to double your money. Simply divide 72 by the annual interest rate. At 6% interest, your money doubles in approximately 72 ÷ 6 = 12 years. At 8%, it doubles in about 9 years." },
          { type: "heading", text: "Practical Tips for Maximizing Compound Interest" },
          { type: "list", items: [
            "Start early — time is the most important factor in compound growth",
            "Reinvest dividends and interest payments automatically",
            "Choose investments with higher compounding frequencies when possible",
            "Make regular additional contributions to accelerate growth",
            "Avoid withdrawing interest — let it compound",
            "Compare APY (Annual Percentage Yield) rather than APR for savings accounts",
          ] },
          { type: "heading", text: "Compound Interest and Debt" },
          { type: "paragraph", text: "Compound interest works both ways. While it grows your savings, it also grows your debt. Credit card interest, for example, compounds daily on most cards. A $5,000 balance at 20% APR, making only minimum payments, could take over 25 years to pay off and cost more than $8,000 in interest alone." },
          { type: "faq", faqItems: [
            { question: "What is the difference between simple and compound interest?", answer: "Simple interest is calculated only on the principal amount, while compound interest is calculated on the principal plus all accumulated interest. Over time, compound interest yields significantly more because you earn interest on your interest." },
            { question: "How often does compound interest compound?", answer: "It depends on the financial product. Savings accounts typically compound daily or monthly. CDs may compound daily, monthly, or quarterly. Bonds usually compound semi-annually. The more frequent the compounding, the higher the effective return." },
            { question: "Is compound interest always beneficial?", answer: "Compound interest benefits savers and investors but works against borrowers. When you have savings or investments, compound interest helps your money grow faster. When you have debt (like credit cards), compound interest makes your balance grow faster too." },
            { question: "What is APY and how does it relate to compound interest?", answer: "APY (Annual Percentage Yield) reflects the total interest earned in a year including the effects of compounding. It's always equal to or higher than the nominal interest rate. APY allows you to compare savings products with different compounding frequencies on an equal basis." },
          ] },
        ],
      },
      ko: {
        title: "복리 이자 계산법: 공식, 예시, 계산기 사용법",
        summary:
          "명확한 공식, 실제 예시, 실용적인 팁으로 복리 이자 계산을 마스터하세요. 저축과 투자를 성장시키는 방법을 알아봅니다.",
        content: [
          { type: "paragraph", text: "복리 이자는 종종 세계 8대 불가사의라고 불리며, 그럴 만한 이유가 있습니다. 작고 규칙적인 저축을 시간이 지남에 따라 상당한 부로 변환시키는 메커니즘입니다. 복리 이자의 작동 방식을 이해하는 것은 현명한 재정 결정을 내리는 데 기본입니다." },
          { type: "heading", text: "복리 이자란?" },
          { type: "paragraph", text: "복리 이자는 초기 원금과 이전 기간의 누적 이자 모두에 대해 계산되는 이자입니다. 원래 금액에 대해서만 이자를 버는 단리와 달리, 복리는 이자에 대한 이자를 벌어 기하급수적 성장 효과를 만듭니다." },
          { type: "heading", text: "복리 이자 공식" },
          { type: "code", language: "text", code: "A = P(1 + r/n)^(nt)\n\n각 변수:\n  A = 최종 금액\n  P = 원금 (초기 투자금)\n  r = 연이율 (소수)\n  n = 연간 복리 횟수\n  t = 년수\n\n예시:\n  P = 1,000만원\n  r = 5% (0.05)\n  n = 12 (월 복리)\n  t = 10년\n\n  A = 1,000만(1 + 0.05/12)^(12 × 10)\n  A = 1,000만(1.004167)^120\n  A = 1,647만원\n\n  이자 수익: 647만원" },
          { type: "callout", text: "핵심 포인트: 이 예시에서 1,000만원 투자로 10년 동안 5% 이율에서 647만원의 이자를 벌었습니다 — 추가 투자 없이. 복리의 힘은 기간이 길어질수록 극적으로 증가합니다." },
          { type: "heading", text: "복리 주기의 중요성" },
          { type: "paragraph", text: "이자가 더 자주 복리되면 더 많이 벌 수 있습니다. 1,000만원을 5% 이율로 10년간 투자할 때 복리 주기별 차이입니다:" },
          { type: "list", items: [
            "연 복리 (1회/년): 1,628만원",
            "분기 복리 (4회/년): 1,643만원",
            "월 복리 (12회/년): 1,647만원",
            "일 복리 (365회/년): 1,648만원",
            "연속 복리: 1,648만원",
          ] },
          { type: "heading", text: "72의 법칙" },
          { type: "paragraph", text: "72의 법칙은 돈이 두 배가 되는 데 걸리는 시간을 빠르게 추정하는 방법입니다. 72를 연이율로 나누면 됩니다. 6% 이율에서 돈은 약 72 ÷ 6 = 12년 만에 두 배가 됩니다. 8%에서는 약 9년이 걸립니다." },
          { type: "heading", text: "복리를 극대화하는 실용 팁" },
          { type: "list", items: [
            "일찍 시작하세요 — 시간이 복리 성장에서 가장 중요한 요소입니다",
            "배당금과 이자를 자동으로 재투자하세요",
            "가능하면 복리 주기가 높은 투자를 선택하세요",
            "정기적으로 추가 납입하여 성장을 가속화하세요",
            "이자를 인출하지 마세요 — 복리되도록 두세요",
            "저축 계좌는 APR이 아닌 APY(연간 수익률)를 비교하세요",
          ] },
          { type: "heading", text: "복리와 부채" },
          { type: "paragraph", text: "복리는 양날의 검입니다. 저축을 늘리는 동시에 부채도 늘립니다. 예를 들어 신용카드 이자는 대부분 일 복리로 계산됩니다. 연 20% 이율의 500만원 잔액은 최소 납입만 하면 상환에 25년 이상 걸리고 이자만 800만원 이상이 될 수 있습니다." },
          { type: "faq", faqItems: [
            { question: "단리와 복리의 차이는 무엇인가요?", answer: "단리는 원금에 대해서만 이자가 계산되고, 복리는 원금과 누적된 이자 모두에 대해 계산됩니다. 시간이 지날수록 복리는 이자에 대한 이자를 벌기 때문에 훨씬 더 많은 수익을 냅니다." },
            { question: "복리 이자는 얼마나 자주 복리되나요?", answer: "금융 상품에 따라 다릅니다. 저축 계좌는 일반적으로 매일 또는 매월 복리됩니다. CD는 매일, 매월, 또는 분기별로 복리될 수 있습니다. 채권은 보통 반기별로 복리됩니다." },
            { question: "복리가 항상 유리한가요?", answer: "복리는 저축자와 투자자에게 유리하지만 차입자에게는 불리하게 작용합니다. 저축이나 투자가 있으면 돈이 더 빨리 불어나지만, 부채(신용카드 등)가 있으면 잔액도 더 빨리 늘어납니다." },
            { question: "APY란 무엇이고 복리와 어떤 관계가 있나요?", answer: "APY(연간 수익률)는 복리 효과를 포함한 1년간 총 이자를 반영합니다. 명목 이율과 같거나 높습니다. APY를 사용하면 복리 주기가 다른 저축 상품을 동등하게 비교할 수 있습니다." },
          ] },
        ],
      },
    },
    relatedTools: [
      { slug: "word-counter", name: { en: "Word Counter", ko: "글자수 세기" } },
    ],
    relatedPosts: ["mortgage-calculator-guide", "retirement-savings-calculator-guide", "emergency-fund-calculator-guide"],
  },
  {
    slug: "mortgage-calculator-guide",
    category: "finance",
    date: "2026-02-17",
    readingTime: 7,
    thumbnailAlt: {
      en: "A house with a calculator and mortgage payment breakdown chart",
      ko: "계산기와 모기지 상환 내역이 표시된 주택 이미지",
    },
    translations: {
      en: {
        title: "Mortgage Calculator Guide: How Much House Can You Afford in 2025",
        summary:
          "Learn how mortgage calculations work, understand monthly payments, and discover practical strategies to determine how much house you can truly afford.",
        content: [
          { type: "paragraph", text: "Buying a home is likely the biggest financial decision you'll ever make. Understanding how mortgages work and how much you can truly afford is crucial to avoiding financial stress and building long-term wealth." },
          { type: "heading", text: "How Mortgage Payments Are Calculated" },
          { type: "paragraph", text: "A standard mortgage payment consists of four components, often called PITI: Principal, Interest, Taxes, and Insurance. The principal and interest portion is calculated using an amortization formula that ensures equal monthly payments over the loan term." },
          { type: "code", language: "text", code: "Monthly Payment Formula:\n  M = P[r(1+r)^n] / [(1+r)^n - 1]\n\nWhere:\n  M = Monthly payment\n  P = Loan principal\n  r = Monthly interest rate (annual rate ÷ 12)\n  n = Total number of payments\n\nExample: $300,000 loan at 6.5% for 30 years\n  r = 0.065/12 = 0.005417\n  n = 30 × 12 = 360\n  M = $1,896.20/month (principal + interest only)\n\n  Add taxes (~1.1%): +$275/month\n  Add insurance: +$125/month\n  Total PITI: ~$2,296/month" },
          { type: "heading", text: "The 28/36 Rule" },
          { type: "paragraph", text: "Financial experts recommend the 28/36 rule as a guideline for how much you should spend on housing:" },
          { type: "list", items: [
            "28% Rule: Your monthly housing costs (PITI) should not exceed 28% of your gross monthly income",
            "36% Rule: Your total monthly debt payments (housing + car loans + student loans + credit cards) should not exceed 36% of your gross monthly income",
            "Example: If your household income is $100,000/year ($8,333/month), your max housing payment should be ~$2,333/month",
          ] },
          { type: "callout", text: "Key Takeaway: Just because a bank will lend you a certain amount doesn't mean you should borrow that much. Banks approve based on their risk tolerance, not your financial comfort. The 28/36 rule helps keep housing costs manageable." },
          { type: "heading", text: "Factors That Affect Your Mortgage" },
          { type: "list", items: [
            "Credit score — higher scores get lower interest rates (potentially saving tens of thousands)",
            "Down payment — 20% down avoids PMI (Private Mortgage Insurance), saving $100-300/month",
            "Loan term — 15-year mortgages have higher payments but save significantly on total interest",
            "Interest rate type — fixed rates provide stability; adjustable rates (ARM) start lower but can increase",
            "Location — property taxes and insurance vary greatly by state and municipality",
          ] },
          { type: "heading", text: "15-Year vs. 30-Year Mortgage" },
          { type: "paragraph", text: "On a $300,000 loan at 6.5%, a 30-year mortgage costs $1,896/month with total interest of $382,633. A 15-year mortgage at 5.9% costs $2,521/month but total interest drops to $153,721 — saving you $228,912. The monthly payment is only $625 more, but the savings are enormous." },
          { type: "heading", text: "Hidden Costs of Homeownership" },
          { type: "list", items: [
            "Maintenance and repairs (budget 1-2% of home value annually)",
            "HOA fees (if applicable, $200-500+/month)",
            "Closing costs (2-5% of loan amount)",
            "Home inspection and appraisal fees",
            "Moving costs and initial furnishing",
            "Utility costs (often higher than renting)",
          ] },
          { type: "faq", faqItems: [
            { question: "How much down payment do I need for a house?", answer: "While 20% is traditional and avoids PMI, many programs allow much less. FHA loans require as little as 3.5% down, and some VA and USDA loans offer 0% down. However, a larger down payment means lower monthly payments and less interest paid overall." },
            { question: "What credit score do I need for a mortgage?", answer: "Conventional loans typically require a minimum credit score of 620. FHA loans may accept scores as low as 580 with 3.5% down. However, higher scores (740+) qualify for the best interest rates, which can save you thousands over the life of the loan." },
            { question: "Should I choose a fixed or adjustable rate mortgage?", answer: "Fixed-rate mortgages provide payment stability and are ideal if you plan to stay long-term. Adjustable-rate mortgages (ARMs) offer lower initial rates, making them suitable if you plan to sell or refinance within 5-7 years. In a rising rate environment, fixed rates offer more protection." },
            { question: "Can I afford a house if I have student loans?", answer: "Yes, but your student loan payments affect your debt-to-income ratio. Lenders typically want total debt payments under 36-43% of gross income. Pay down high-interest debt first, and consider income-driven repayment plans to lower monthly obligations before applying." },
          ] },
        ],
      },
      ko: {
        title: "모기지 계산기 가이드: 2025년 얼마짜리 집을 살 수 있을까",
        summary:
          "모기지 계산 방법을 이해하고, 월 상환액을 파악하며, 실제로 감당할 수 있는 주택 가격을 결정하는 실용적인 전략을 알아보세요.",
        content: [
          { type: "paragraph", text: "주택 구매는 인생에서 가장 큰 재정적 결정일 것입니다. 모기지의 작동 방식과 실제로 감당할 수 있는 금액을 이해하는 것은 재정적 스트레스를 피하고 장기적인 자산을 구축하는 데 매우 중요합니다." },
          { type: "heading", text: "모기지 상환액 계산 방법" },
          { type: "paragraph", text: "표준 모기지 상환액은 원금, 이자, 세금, 보험의 네 가지 구성 요소로 이루어져 있으며, 이를 PITI라고 합니다. 원금과 이자 부분은 대출 기간 동안 동일한 월 상환액을 보장하는 상각 공식을 사용하여 계산됩니다." },
          { type: "code", language: "text", code: "월 상환액 공식:\n  M = P[r(1+r)^n] / [(1+r)^n - 1]\n\n각 변수:\n  M = 월 상환액\n  P = 대출 원금\n  r = 월 이율 (연이율 ÷ 12)\n  n = 총 상환 횟수\n\n예시: 3억원 대출, 연 6.5%, 30년\n  r = 0.065/12 = 0.005417\n  n = 30 × 12 = 360\n  M = 약 189만원/월 (원리금만)\n\n  재산세 추가 (~1.1%): +약 27만원/월\n  보험 추가: +약 12만원/월\n  총 PITI: 약 228만원/월" },
          { type: "heading", text: "28/36 규칙" },
          { type: "paragraph", text: "재정 전문가들은 주거비 지출에 대한 가이드라인으로 28/36 규칙을 권장합니다:" },
          { type: "list", items: [
            "28% 규칙: 월 주거비(PITI)가 월 총소득의 28%를 초과하지 않아야 합니다",
            "36% 규칙: 총 월 부채 상환액(주거비 + 자동차 대출 + 학자금 대출 + 카드)이 월 총소득의 36%를 초과하지 않아야 합니다",
            "예시: 가구 연소득이 6,000만원(월 500만원)이면, 최대 주거비는 약 140만원/월",
          ] },
          { type: "callout", text: "핵심 포인트: 은행이 특정 금액을 대출해준다고 해서 그만큼 빌려야 하는 것은 아닙니다. 은행은 자체 위험 허용도에 따라 승인하지, 여러분의 재정적 편안함에 따라 승인하는 것이 아닙니다. 28/36 규칙은 주거비를 관리 가능한 수준으로 유지하는 데 도움이 됩니다." },
          { type: "heading", text: "모기지에 영향을 미치는 요소" },
          { type: "list", items: [
            "신용 점수 — 높은 점수는 낮은 이율을 받습니다 (수천만원 절약 가능)",
            "계약금 — 20% 이상이면 PMI(개인 모기지 보험)를 피할 수 있어 월 10-30만원 절약",
            "대출 기간 — 15년 모기지는 상환액이 높지만 총 이자에서 크게 절약",
            "이율 유형 — 고정 이율은 안정성 제공; 변동 이율(ARM)은 초기에 낮지만 상승 가능",
            "위치 — 재산세와 보험료는 지역에 따라 크게 다릅니다",
          ] },
          { type: "heading", text: "15년 vs. 30년 모기지" },
          { type: "paragraph", text: "3억원 대출, 6.5% 이율에서 30년 모기지는 월 189만원, 총 이자 3억 8,200만원입니다. 15년 모기지(5.9%)는 월 252만원이지만 총 이자가 1억 5,300만원으로 줄어 2억 2,800만원을 절약합니다. 월 상환액은 63만원만 더 높지만 절약 효과는 엄청납니다." },
          { type: "heading", text: "주택 소유의 숨겨진 비용" },
          { type: "list", items: [
            "유지 보수 및 수리 (연간 주택 가치의 1-2% 예산)",
            "관리비 (해당 시 월 20-50만원 이상)",
            "취득세 및 등록세 (매매가의 1-3%)",
            "주택 검사 및 감정 비용",
            "이사 비용 및 초기 인테리어",
            "공과금 (임대보다 높은 경우가 많음)",
          ] },
          { type: "faq", faqItems: [
            { question: "주택 구매 시 계약금은 얼마나 필요한가요?", answer: "전통적으로 20%가 권장되며 PMI를 피할 수 있지만, 많은 프로그램에서 훨씬 적은 금액을 허용합니다. 한국의 경우 LTV(주택담보대출비율) 규제에 따라 지역과 주택 유형에 따라 다르며, 일반적으로 40-70%까지 대출이 가능합니다." },
            { question: "모기지를 받으려면 어떤 신용 점수가 필요한가요?", answer: "한국에서는 NICE나 KCB 신용점수가 700점 이상이면 대부분의 은행에서 유리한 조건으로 대출을 받을 수 있습니다. 점수가 높을수록 더 낮은 이율을 적용받아 대출 기간 동안 수백만원을 절약할 수 있습니다." },
            { question: "고정 금리와 변동 금리 중 어떤 것을 선택해야 하나요?", answer: "고정 금리는 상환 안정성을 제공하며 장기 거주 계획이 있을 때 적합합니다. 변동 금리는 초기 이율이 낮아 5-7년 내 매도나 재융자를 계획할 때 적합합니다. 금리 상승기에는 고정 금리가 더 많은 보호를 제공합니다." },
            { question: "학자금 대출이 있어도 집을 살 수 있나요?", answer: "가능하지만, 학자금 대출 상환액이 총부채상환비율(DTI)에 영향을 줍니다. 대출 기관은 일반적으로 총 부채 상환액이 총소득의 36-43% 이하를 원합니다. 고금리 부채를 먼저 상환하고 신청 전 월 상환 부담을 줄이는 것이 좋습니다." },
          ] },
        ],
      },
    },
    relatedTools: [
      { slug: "word-counter", name: { en: "Word Counter", ko: "글자수 세기" } },
    ],
    relatedPosts: ["compound-interest-calculator-guide", "retirement-savings-calculator-guide", "emergency-fund-calculator-guide"],
  },
  {
    slug: "bmi-calculator-guide",
    category: "finance",
    date: "2026-02-14",
    readingTime: 6,
    thumbnailAlt: {
      en: "A BMI chart showing different weight categories with a measuring tape",
      ko: "줄자와 함께 다양한 체중 범주를 보여주는 BMI 차트",
    },
    translations: {
      en: {
        title: "BMI Calculator: What Your Body Mass Index Really Means",
        summary:
          "Understand what BMI is, how it's calculated, its limitations, and what your number actually means for your health. A comprehensive guide with practical advice.",
        content: [
          { type: "paragraph", text: "Body Mass Index (BMI) is one of the most widely used health screening tools in the world. While it has its limitations, understanding your BMI can be a useful starting point for assessing your overall health." },
          { type: "heading", text: "What Is BMI?" },
          { type: "paragraph", text: "BMI is a numerical value calculated from your weight and height. It provides a simple way to categorize individuals as underweight, normal weight, overweight, or obese. The formula was developed by Belgian mathematician Adolphe Quetelet in the 1830s." },
          { type: "heading", text: "How to Calculate BMI" },
          { type: "code", language: "text", code: "BMI Formula:\n  Metric:   BMI = weight(kg) / height(m)²\n  Imperial: BMI = 703 × weight(lb) / height(in)²\n\nExample:\n  Weight: 70 kg\n  Height: 175 cm (1.75 m)\n  BMI = 70 / (1.75)² = 70 / 3.0625 = 22.86\n\nBMI Categories:\n  Under 18.5      → Underweight\n  18.5 – 24.9     → Normal weight\n  25.0 – 29.9     → Overweight\n  30.0 – 34.9     → Obesity Class I\n  35.0 – 39.9     → Obesity Class II\n  40.0 and above   → Obesity Class III" },
          { type: "heading", text: "What Your BMI Number Means" },
          { type: "paragraph", text: "A BMI in the \"normal\" range (18.5-24.9) is generally associated with lower health risks. However, BMI is just one piece of the puzzle. It doesn't measure body fat directly, nor does it account for muscle mass, bone density, age, sex, or ethnicity — all of which affect health risk." },
          { type: "callout", text: "Key Takeaway: BMI is a screening tool, not a diagnostic tool. A high BMI doesn't necessarily mean you're unhealthy (athletes often have high BMIs due to muscle mass), and a normal BMI doesn't guarantee good health. Always consult with a healthcare provider for a complete assessment." },
          { type: "heading", text: "Limitations of BMI" },
          { type: "list", items: [
            "Doesn't distinguish between muscle and fat (a muscular athlete may have a \"overweight\" BMI)",
            "Doesn't account for fat distribution (belly fat is more dangerous than hip fat)",
            "Less accurate for elderly people who naturally lose muscle mass",
            "May underestimate body fat in people who have lost muscle",
            "Different ethnic groups may have different health risks at the same BMI",
            "Not suitable for children — pediatric BMI uses age and sex-specific percentiles",
          ] },
          { type: "heading", text: "Better Metrics to Use Alongside BMI" },
          { type: "list", items: [
            "Waist circumference — measures abdominal fat (men: <40in/102cm, women: <35in/88cm)",
            "Waist-to-hip ratio — another measure of fat distribution",
            "Body fat percentage — measured via DEXA scan, bioelectrical impedance, or calipers",
            "Waist-to-height ratio — waist should be less than half your height",
          ] },
          { type: "heading", text: "Healthy Weight Management Tips" },
          { type: "list", items: [
            "Focus on overall health, not just the number on the scale",
            "Aim for gradual changes — 0.5-1 kg per week is sustainable",
            "Combine cardio with strength training to preserve muscle mass",
            "Prioritize whole foods, adequate protein, and proper hydration",
            "Get 7-9 hours of quality sleep — poor sleep affects metabolism and hunger hormones",
          ] },
          { type: "faq", faqItems: [
            { question: "Is BMI accurate for everyone?", answer: "No. BMI is a general screening tool that works well for population-level analysis but has significant limitations for individuals. Athletes, elderly individuals, and people of different ethnic backgrounds may get misleading results. Use BMI as one of several health indicators." },
            { question: "What is a healthy BMI for adults?", answer: "The \"normal\" BMI range is 18.5 to 24.9. However, health isn't determined by a single number. Someone with a BMI of 26 who exercises regularly and eats well may be healthier than someone with a BMI of 22 who is sedentary. Context matters." },
            { question: "Can BMI be used for children?", answer: "Standard BMI categories are not used for children. Pediatric BMI is calculated the same way but interpreted using age- and sex-specific growth charts, expressed as percentiles. A pediatrician should assess children's weight status." },
            { question: "How often should I check my BMI?", answer: "Checking BMI once or twice a year is sufficient for most adults. More important than the exact number is the trend over time. If your BMI is gradually increasing, it may be worth evaluating your diet and activity levels." },
          ] },
        ],
      },
      ko: {
        title: "BMI 계산기: 체질량지수가 진짜 의미하는 것",
        summary:
          "BMI가 무엇인지, 어떻게 계산하는지, 한계점은 무엇인지, 그리고 당신의 수치가 건강에 실제로 무엇을 의미하는지 알아보세요.",
        content: [
          { type: "paragraph", text: "체질량지수(BMI)는 세계에서 가장 널리 사용되는 건강 선별 도구 중 하나입니다. 한계가 있지만, BMI를 이해하는 것은 전반적인 건강을 평가하는 유용한 출발점이 될 수 있습니다." },
          { type: "heading", text: "BMI란?" },
          { type: "paragraph", text: "BMI는 체중과 키로 계산되는 수치입니다. 개인을 저체중, 정상 체중, 과체중, 비만으로 분류하는 간단한 방법을 제공합니다. 이 공식은 1830년대 벨기에 수학자 아돌프 케틀레가 개발했습니다." },
          { type: "heading", text: "BMI 계산 방법" },
          { type: "code", language: "text", code: "BMI 공식:\n  BMI = 체중(kg) / 신장(m)²\n\n예시:\n  체중: 70 kg\n  신장: 175 cm (1.75 m)\n  BMI = 70 / (1.75)² = 70 / 3.0625 = 22.86\n\nBMI 분류:\n  18.5 미만        → 저체중\n  18.5 – 22.9     → 정상 (아시아 기준)\n  23.0 – 24.9     → 과체중 (아시아 기준)\n  25.0 – 29.9     → 비만 1단계\n  30.0 이상        → 비만 2단계" },
          { type: "heading", text: "BMI 수치의 의미" },
          { type: "paragraph", text: "\"정상\" 범위의 BMI(한국 기준 18.5-22.9)는 일반적으로 낮은 건강 위험과 관련이 있습니다. 하지만 BMI는 퍼즐의 한 조각일 뿐입니다. 체지방을 직접 측정하지 않으며, 근육량, 골밀도, 나이, 성별, 민족성을 고려하지 않습니다." },
          { type: "callout", text: "핵심 포인트: BMI는 선별 도구이지 진단 도구가 아닙니다. 높은 BMI가 반드시 건강하지 않다는 것을 의미하지 않으며(운동선수는 근육량으로 높은 BMI를 가질 수 있음), 정상 BMI가 좋은 건강을 보장하지도 않습니다. 완전한 평가를 위해 항상 의료 전문가와 상담하세요." },
          { type: "heading", text: "BMI의 한계" },
          { type: "list", items: [
            "근육과 지방을 구분하지 못합니다 (근육질 운동선수가 \"과체중\" BMI를 가질 수 있음)",
            "지방 분포를 고려하지 않습니다 (복부 지방이 엉덩이 지방보다 위험)",
            "자연적으로 근육량이 감소하는 노인에게 덜 정확합니다",
            "근육을 잃은 사람의 체지방을 과소평가할 수 있습니다",
            "같은 BMI에서도 민족에 따라 건강 위험이 다를 수 있습니다 (아시아인 기준은 더 낮음)",
          ] },
          { type: "heading", text: "BMI와 함께 사용할 더 나은 지표" },
          { type: "list", items: [
            "허리둘레 — 복부 지방 측정 (남성: 90cm 미만, 여성: 85cm 미만, 한국 기준)",
            "허리-엉덩이 비율 — 지방 분포의 또 다른 측정",
            "체지방률 — DEXA 스캔, 생체 전기 임피던스, 캘리퍼로 측정",
            "허리-키 비율 — 허리둘레가 키의 절반 미만이어야 합니다",
          ] },
          { type: "heading", text: "건강한 체중 관리 팁" },
          { type: "list", items: [
            "체중계 숫자가 아닌 전반적인 건강에 집중하세요",
            "점진적인 변화를 목표로 하세요 — 주 0.5-1kg이 지속 가능합니다",
            "근육량을 보존하기 위해 유산소와 근력 운동을 병행하세요",
            "자연식품, 충분한 단백질, 적절한 수분 섭취를 우선시하세요",
            "7-9시간의 양질의 수면을 취하세요 — 수면 부족은 대사와 배고픔 호르몬에 영향을 줍니다",
          ] },
          { type: "faq", faqItems: [
            { question: "BMI는 모든 사람에게 정확한가요?", answer: "아닙니다. BMI는 인구 수준 분석에는 잘 작동하지만 개인에게는 상당한 한계가 있는 일반 선별 도구입니다. 운동선수, 노인, 다른 민족 배경의 사람들은 오해의 소지가 있는 결과를 얻을 수 있습니다." },
            { question: "성인의 건강한 BMI는 얼마인가요?", answer: "한국인 기준 정상 BMI 범위는 18.5~22.9입니다 (WHO 기준과 다름). 하지만 건강은 단일 숫자로 결정되지 않습니다. BMI 24이지만 규칙적으로 운동하고 잘 먹는 사람이 BMI 21이지만 앉아만 있는 사람보다 건강할 수 있습니다." },
            { question: "어린이에게 BMI를 사용할 수 있나요?", answer: "표준 BMI 분류는 어린이에게 사용하지 않습니다. 소아 BMI는 같은 방식으로 계산되지만 연령 및 성별별 성장 차트를 사용하여 백분위수로 해석됩니다. 소아과 의사가 어린이의 체중 상태를 평가해야 합니다." },
            { question: "BMI를 얼마나 자주 확인해야 하나요?", answer: "대부분의 성인은 1년에 1-2번 확인하면 충분합니다. 정확한 숫자보다 시간에 따른 추세가 더 중요합니다. BMI가 점차 증가하고 있다면 식단과 활동 수준을 평가해볼 필요가 있습니다." },
          ] },
        ],
      },
    },
    relatedTools: [
      { slug: "word-counter", name: { en: "Word Counter", ko: "글자수 세기" } },
    ],
    relatedPosts: ["compound-interest-calculator-guide", "calorie-calculator-guide"],
  },
  {
    slug: "retirement-savings-calculator-guide",
    category: "finance",
    date: "2026-02-10",
    readingTime: 8,
    thumbnailAlt: {
      en: "A retirement nest egg with growing savings chart and calendar",
      ko: "성장하는 저축 차트와 달력이 있는 은퇴 자금 이미지",
    },
    translations: {
      en: {
        title: "Retirement Savings Calculator: How Much Do You Need to Retire",
        summary:
          "Calculate how much you need to save for retirement using proven formulas and strategies. Learn about the 4% rule, catch-up contributions, and retirement planning by age.",
        content: [
          { type: "paragraph", text: "One of life's biggest financial questions is: \"How much do I need to retire?\" The answer depends on many personal factors, but understanding the key principles of retirement planning can help you create a realistic savings goal and strategy." },
          { type: "heading", text: "The 4% Rule" },
          { type: "paragraph", text: "The 4% rule is a widely used guideline suggesting you can safely withdraw 4% of your retirement savings annually without running out of money over a 30-year retirement. This means you need 25 times your annual expenses saved for retirement." },
          { type: "code", language: "text", code: "4% Rule Calculator:\n\n  Step 1: Estimate annual retirement expenses\n          Example: $50,000/year\n\n  Step 2: Multiply by 25\n          $50,000 × 25 = $1,250,000\n\n  You need approximately $1,250,000 saved for retirement.\n\n  Monthly withdrawal: $1,250,000 × 0.04 / 12 = $4,167/month\n\nAge-based savings milestones:\n  By 30: 1× annual salary saved\n  By 40: 3× annual salary saved\n  By 50: 6× annual salary saved\n  By 60: 8× annual salary saved\n  By 67: 10× annual salary saved" },
          { type: "callout", text: "Key Takeaway: To maintain a $50,000/year lifestyle in retirement, you'd need approximately $1.25 million. Starting early makes this achievable — a 25-year-old saving $500/month at 7% average return will have over $1.3 million by age 65." },
          { type: "heading", text: "How Much Should You Save Each Month?" },
          { type: "paragraph", text: "The general guideline is to save 15-20% of your gross income for retirement, including any employer match. If you're starting later, you may need to save more aggressively:" },
          { type: "list", items: [
            "Starting at 25: Save 10-15% of income (time is on your side)",
            "Starting at 35: Save 15-20% of income",
            "Starting at 45: Save 25-30% of income (consider catch-up contributions)",
            "Starting at 55: Save 30%+ and maximize all tax-advantaged accounts",
          ] },
          { type: "heading", text: "Retirement Account Types" },
          { type: "list", items: [
            "401(k)/403(b) — employer-sponsored, pre-tax contributions, employer match possible",
            "Traditional IRA — tax-deductible contributions, taxed on withdrawal",
            "Roth IRA — after-tax contributions, tax-free growth and withdrawals",
            "HSA (Health Savings Account) — triple tax advantage, can be used for retirement after 65",
            "Taxable brokerage account — no tax advantages but no withdrawal restrictions",
          ] },
          { type: "heading", text: "The Power of Starting Early" },
          { type: "paragraph", text: "Consider two scenarios: Person A starts saving $300/month at age 25, and Person B starts saving $600/month at age 35. Both earn 7% annual returns and retire at 65. Person A contributes $144,000 total and has $734,000. Person B contributes $216,000 total but only has $567,000. Starting 10 years earlier, with smaller contributions, produces $167,000 more." },
          { type: "heading", text: "Common Retirement Planning Mistakes" },
          { type: "list", items: [
            "Not starting early enough — every year of delay is costly",
            "Underestimating healthcare costs (plan for $300,000+ for a couple)",
            "Not accounting for inflation (today's $50K will need ~$90K in 20 years at 3%)",
            "Withdrawing from retirement accounts early (10% penalty + taxes)",
            "Being too conservative with investments when young",
            "Not taking full advantage of employer matching (it's free money!)",
            "Forgetting about Social Security or pension adjustments",
          ] },
          { type: "faq", faqItems: [
            { question: "How much money do I need to retire comfortably?", answer: "A common guideline is 25 times your annual expenses (based on the 4% rule). For a $50,000/year lifestyle, that's $1.25 million. However, your actual needs depend on healthcare costs, desired lifestyle, location, and whether you'll have other income sources like Social Security or pensions." },
            { question: "Is $1 million enough to retire?", answer: "Using the 4% rule, $1 million provides about $40,000/year or $3,333/month. Whether that's enough depends on your expenses, location, and other income. In high-cost areas, it may be tight. In lower-cost areas or with additional income sources, it could be comfortable." },
            { question: "What is the best age to retire?", answer: "There's no universal answer. Full Social Security benefits start at 67 for most Americans. However, early retirement is possible with sufficient savings. Many financial planners suggest targeting the age when your savings can sustain your desired lifestyle for 30+ years." },
            { question: "Should I prioritize paying off debt or saving for retirement?", answer: "Generally, always contribute enough to get your employer's full 401(k) match (free money). Then pay off high-interest debt (above 7-8%). After that, maximize retirement contributions. Low-interest debt (mortgages, student loans under 5%) can be paid alongside retirement savings." },
          ] },
        ],
      },
      ko: {
        title: "은퇴 자금 계산기: 은퇴하려면 얼마가 필요할까",
        summary:
          "검증된 공식과 전략으로 은퇴에 필요한 저축액을 계산하세요. 4% 규칙, 추가 납입, 연령별 은퇴 계획에 대해 알아봅니다.",
        content: [
          { type: "paragraph", text: "인생의 가장 큰 재정적 질문 중 하나는 \"은퇴하려면 얼마가 필요한가?\"입니다. 답은 많은 개인적 요인에 따라 다르지만, 은퇴 계획의 핵심 원칙을 이해하면 현실적인 저축 목표와 전략을 세울 수 있습니다." },
          { type: "heading", text: "4% 규칙" },
          { type: "paragraph", text: "4% 규칙은 30년 은퇴 기간 동안 매년 은퇴 저축의 4%를 인출해도 돈이 고갈되지 않는다는 널리 사용되는 가이드라인입니다. 이는 연간 지출의 25배를 은퇴를 위해 저축해야 함을 의미합니다." },
          { type: "code", language: "text", code: "4% 규칙 계산기:\n\n  1단계: 연간 은퇴 지출 추정\n         예시: 3,000만원/년\n\n  2단계: 25를 곱하기\n         3,000만원 × 25 = 7억 5,000만원\n\n  은퇴를 위해 약 7억 5,000만원이 필요합니다.\n\n  월 인출액: 7.5억 × 0.04 / 12 = 250만원/월\n\n연령별 저축 마일스톤:\n  30세: 연봉의 1배\n  40세: 연봉의 3배\n  50세: 연봉의 6배\n  60세: 연봉의 8배\n  65세: 연봉의 10배" },
          { type: "callout", text: "핵심 포인트: 연 3,000만원 생활 수준을 은퇴 후에도 유지하려면 약 7.5억원이 필요합니다. 일찍 시작하면 달성 가능합니다 — 25세에 월 50만원을 연 7% 수익률로 저축하면 65세에 약 13억원 이상을 모을 수 있습니다." },
          { type: "heading", text: "매월 얼마를 저축해야 할까?" },
          { type: "paragraph", text: "일반적인 가이드라인은 총소득의 15-20%를 은퇴를 위해 저축하는 것입니다. 늦게 시작할수록 더 적극적으로 저축해야 합니다:" },
          { type: "list", items: [
            "25세 시작: 소득의 10-15% 저축 (시간이 편)",
            "35세 시작: 소득의 15-20% 저축",
            "45세 시작: 소득의 25-30% 저축",
            "55세 시작: 30% 이상 저축, 모든 세제 혜택 계좌 최대화",
          ] },
          { type: "heading", text: "한국의 은퇴 계좌 종류" },
          { type: "list", items: [
            "국민연금 — 의무 가입, 소득의 9% (근로자/사업주 각 4.5%)",
            "퇴직연금(DB/DC/IRP) — 직장 제공, 세액공제 혜택",
            "개인형 퇴직연금(IRP) — 연 최대 1,800만원 납입, 세액공제",
            "연금저축 — 연 600만원까지 세액공제 (IRP 합산 900만원)",
            "ISA(개인종합자산관리계좌) — 비과세/분리과세 혜택",
          ] },
          { type: "heading", text: "일찍 시작하는 것의 힘" },
          { type: "paragraph", text: "두 가지 시나리오를 비교해보세요: A는 25세에 월 30만원 저축 시작, B는 35세에 월 60만원 저축 시작. 둘 다 연 7% 수익률, 65세 은퇴. A는 총 1억 4,400만원을 납입하고 약 7억 3,000만원을 모읍니다. B는 총 2억 1,600만원을 납입하지만 약 5억 6,700만원만 모읍니다. 10년 일찍 시작한 A가 적은 납입으로도 1억 6,000만원 이상 더 모읍니다." },
          { type: "heading", text: "흔한 은퇴 계획 실수" },
          { type: "list", items: [
            "충분히 일찍 시작하지 않기 — 매년의 지연은 비용이 큽니다",
            "의료비 과소평가 (부부 기준 3억원 이상 계획 필요)",
            "인플레이션 미반영 (현재 3,000만원은 20년 후 약 5,400만원 필요)",
            "은퇴 계좌에서 조기 인출 (세금 + 패널티)",
            "젊을 때 너무 보수적인 투자",
            "회사 매칭을 최대한 활용하지 않기 (무료 돈!)",
            "국민연금 수령액 변동 미고려",
          ] },
          { type: "faq", faqItems: [
            { question: "편안하게 은퇴하려면 얼마가 필요한가요?", answer: "일반적인 가이드라인은 연간 지출의 25배입니다 (4% 규칙). 연 3,000만원 생활을 위해서는 약 7.5억원이 필요합니다. 하지만 실제 필요 금액은 의료비, 원하는 생활 수준, 거주지, 국민연금 등 다른 소득원에 따라 달라집니다." },
            { question: "10억원이면 은퇴하기에 충분한가요?", answer: "4% 규칙으로 10억원은 연 4,000만원(월 약 333만원)을 제공합니다. 생활비, 거주지, 기타 소득에 따라 충분할 수도 부족할 수도 있습니다. 국민연금, 퇴직연금 등을 합산하면 더 여유로울 수 있습니다." },
            { question: "은퇴하기 가장 좋은 나이는?", answer: "보편적인 답은 없습니다. 한국의 국민연금 수령 시작 나이는 현재 63세(1969년 이후 출생자는 65세)입니다. 하지만 충분한 저축이 있으면 조기 은퇴도 가능합니다. 저축이 30년 이상 원하는 생활을 유지할 수 있는 시점을 목표로 하세요." },
            { question: "부채 상환과 은퇴 저축 중 무엇을 우선해야 하나요?", answer: "일반적으로 먼저 회사 퇴직연금 매칭을 최대한 활용하세요 (무료 돈). 그 다음 고금리 부채(7-8% 이상)를 상환하세요. 그 후 은퇴 저축을 최대화하세요. 저금리 부채(주택담보대출, 5% 미만 학자금 대출)는 은퇴 저축과 병행할 수 있습니다." },
          ] },
        ],
      },
    },
    relatedTools: [
      { slug: "word-counter", name: { en: "Word Counter", ko: "글자수 세기" } },
    ],
    relatedPosts: ["compound-interest-calculator-guide", "mortgage-calculator-guide"],
  },
  {
    slug: "lorem-ipsum-history-and-usage",
    category: "generators",
    date: "2026-02-07",
    readingTime: 5,
    thumbnailAlt: {
      en: "Ancient Roman manuscript with Lorem Ipsum text and modern design tools",
      ko: "Lorem Ipsum 텍스트가 있는 고대 로마 필사본과 현대 디자인 도구",
    },
    translations: {
      en: {
        title: "What is Lorem Ipsum? History, Uses, and Modern Alternatives",
        summary:
          "Discover the fascinating history behind Lorem Ipsum, learn when and why designers use placeholder text, and explore modern alternatives for your projects.",
        content: [
          { type: "paragraph", text: "If you've ever worked with design mockups, website templates, or document layouts, you've likely encountered \"Lorem Ipsum dolor sit amet...\" — the world's most famous placeholder text. But where did it come from, and why do we still use it after centuries?" },
          { type: "heading", text: "The Origin of Lorem Ipsum" },
          { type: "paragraph", text: "Contrary to popular belief, Lorem Ipsum is not simply random Latin. It's derived from \"De Finibus Bonorum et Malorum\" (On the Ends of Good and Evil), a philosophical work by Roman statesman Cicero written in 45 BC. The standard Lorem Ipsum passage has been used as placeholder text since the 1500s, when an unknown printer scrambled a section of Cicero's text to create a type specimen book." },
          { type: "callout", text: "Key Takeaway: Lorem Ipsum has survived over 500 years of use in the printing and typesetting industry. Its longevity is a testament to its effectiveness as a layout tool — it mimics the visual appearance of real text without distracting readers with meaningful content." },
          { type: "heading", text: "Why Use Lorem Ipsum?" },
          { type: "list", items: [
            "Focuses attention on design, not content — readers won't get distracted reading the text",
            "Mimics realistic text distribution with varied word lengths and sentence structures",
            "Universally recognized — clients and team members understand it's placeholder text",
            "Available in any quantity — easy to generate paragraphs, sentences, or words as needed",
            "Language-neutral — works across all design projects regardless of the final language",
          ] },
          { type: "cta", tool: "lorem-ipsum-generator", toolName: "Lorem Ipsum Generator" },
          { type: "heading", text: "When NOT to Use Lorem Ipsum" },
          { type: "paragraph", text: "While Lorem Ipsum is incredibly useful, there are situations where real or semi-real content is better:" },
          { type: "list", items: [
            "User testing — participants need real content to evaluate usability effectively",
            "Content-driven design — when the content should shape the design (not vice versa)",
            "Client presentations — real content helps clients visualize the final product",
            "Accessibility testing — real text is needed to test screen readers and readability",
            "SEO layouts — placeholder text won't reveal content hierarchy issues",
          ] },
          { type: "heading", text: "Modern Alternatives to Lorem Ipsum" },
          { type: "paragraph", text: "Several creative alternatives have emerged for designers who want something different:" },
          { type: "list", items: [
            "Hipster Ipsum — trendy, hipster-themed placeholder text",
            "Bacon Ipsum — meat-themed dummy text for the hungry designer",
            "Cupcake Ipsum — sweet, dessert-flavored placeholder text",
            "Corporate Ipsum — realistic business jargon for enterprise mockups",
            "Real content snippets — using actual articles or documentation drafts",
          ] },
          { type: "heading", text: "The Original Lorem Ipsum Text" },
          { type: "code", language: "text", code: "The standard Lorem Ipsum passage (used since the 1500s):\n\n\"Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore\nmagna aliqua. Ut enim ad minim veniam, quis nostrud\nexercitation ullamco laboris nisi ut aliquip ex ea\ncommodo consequat.\"\n\nFrom Cicero's original (45 BC):\n\"Neque porro quisquam est, qui dolorem ipsum quia\ndolor sit amet, consectetur, adipisci velit...\"\n(\"There is no one who loves pain itself, who seeks\nafter it and wants to have it, simply because it\nis pain...\")" },
          { type: "heading", text: "Best Practices for Using Placeholder Text" },
          { type: "list", items: [
            "Match the approximate length of final content when possible",
            "Use varied paragraph lengths to test layout flexibility",
            "Include headings, lists, and other formatting to test all content types",
            "Replace placeholder text before launch — search your codebase for \"lorem\" before deployment",
            "Consider using content-first design when the message is critical",
          ] },
          { type: "faq", faqItems: [
            { question: "Is Lorem Ipsum real Latin?", answer: "Partially. It's based on a real Latin text by Cicero (45 BC), but the standard passage has been altered, with words changed, added, and removed over the centuries. It's not meant to be readable Latin — its purpose is purely visual." },
            { question: "Why not just use random English text as placeholder?", answer: "English (or any readable language) is distracting — people naturally start reading and evaluating the content instead of focusing on the design. Lorem Ipsum looks like real text but prevents this distraction, keeping the focus on layout and typography." },
            { question: "Can Lorem Ipsum affect SEO?", answer: "Yes, negatively. Never publish a page with Lorem Ipsum text. Search engines may flag it as thin or low-quality content. Always replace all placeholder text with real, meaningful content before publishing. Use our Word Counter to verify your content meets length requirements." },
            { question: "How much Lorem Ipsum should I generate for a mockup?", answer: "Match the expected content length. For blog posts, generate 300-500 words. For landing pages, 100-200 words per section. For product descriptions, 50-100 words. Use varied lengths across sections to test layout adaptability." },
          ] },
        ],
      },
      ko: {
        title: "Lorem Ipsum이란? 역사, 용도, 최신 대안 총정리",
        summary:
          "Lorem Ipsum의 흥미로운 역사를 발견하고, 디자이너가 플레이스홀더 텍스트를 사용하는 이유를 알아보며, 프로젝트를 위한 최신 대안을 살펴보세요.",
        content: [
          { type: "paragraph", text: "디자인 목업, 웹사이트 템플릿, 문서 레이아웃 작업을 해본 적이 있다면 \"Lorem Ipsum dolor sit amet...\"을 만난 적이 있을 것입니다 — 세계에서 가장 유명한 플레이스홀더 텍스트. 하지만 어디서 왔고, 왜 수세기가 지난 지금도 사용할까요?" },
          { type: "heading", text: "Lorem Ipsum의 기원" },
          { type: "paragraph", text: "일반적인 믿음과 달리, Lorem Ipsum은 단순한 무작위 라틴어가 아닙니다. 기원전 45년 로마 정치가 키케로가 쓴 철학 작품 \"De Finibus Bonorum et Malorum\"(선과 악의 목적에 대하여)에서 유래했습니다. 표준 Lorem Ipsum 구절은 1500년대부터 플레이스홀더 텍스트로 사용되어 왔으며, 무명의 인쇄공이 키케로의 텍스트를 섞어 활자 견본 책을 만들면서 시작되었습니다." },
          { type: "callout", text: "핵심 포인트: Lorem Ipsum은 인쇄 및 조판 산업에서 500년 이상 사용되어 왔습니다. 이 오랜 역사는 레이아웃 도구로서의 효과를 증명합니다 — 의미 있는 내용으로 독자를 산만하게 하지 않으면서 실제 텍스트의 시각적 외관을 모방합니다." },
          { type: "heading", text: "Lorem Ipsum을 사용하는 이유" },
          { type: "list", items: [
            "내용이 아닌 디자인에 집중 — 독자가 텍스트를 읽느라 산만해지지 않습니다",
            "다양한 단어 길이와 문장 구조로 사실적인 텍스트 분포를 모방",
            "보편적으로 인정 — 클라이언트와 팀원이 플레이스홀더 텍스트임을 이해합니다",
            "원하는 양만큼 사용 가능 — 문단, 문장, 단어를 필요에 따라 쉽게 생성",
            "언어 중립적 — 최종 언어에 관계없이 모든 디자인 프로젝트에서 작동",
          ] },
          { type: "cta", tool: "lorem-ipsum-generator", toolName: "Lorem Ipsum 생성기" },
          { type: "heading", text: "Lorem Ipsum을 사용하면 안 되는 경우" },
          { type: "paragraph", text: "Lorem Ipsum이 매우 유용하지만, 실제 또는 반실제 콘텐츠가 더 나은 상황이 있습니다:" },
          { type: "list", items: [
            "사용자 테스트 — 참가자가 사용성을 효과적으로 평가하려면 실제 콘텐츠가 필요",
            "콘텐츠 중심 디자인 — 콘텐츠가 디자인을 형성해야 할 때",
            "클라이언트 프레젠테이션 — 실제 콘텐츠가 최종 제품 시각화에 도움",
            "접근성 테스트 — 스크린 리더와 가독성 테스트에 실제 텍스트 필요",
            "SEO 레이아웃 — 플레이스홀더 텍스트로는 콘텐츠 계층 문제를 파악할 수 없음",
          ] },
          { type: "heading", text: "Lorem Ipsum의 현대 대안" },
          { type: "paragraph", text: "다른 것을 원하는 디자이너를 위해 여러 창의적인 대안이 등장했습니다:" },
          { type: "list", items: [
            "Hipster Ipsum — 트렌디한 힙스터 테마 플레이스홀더 텍스트",
            "Bacon Ipsum — 육류 테마 더미 텍스트",
            "Cupcake Ipsum — 달콤한 디저트 풍미의 플레이스홀더 텍스트",
            "Corporate Ipsum — 기업 목업을 위한 사실적인 비즈니스 용어",
            "실제 콘텐츠 스니펫 — 실제 기사나 문서 초안 사용",
          ] },
          { type: "heading", text: "원본 Lorem Ipsum 텍스트" },
          { type: "code", language: "text", code: "표준 Lorem Ipsum 구절 (1500년대부터 사용):\n\n\"Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore\nmagna aliqua. Ut enim ad minim veniam, quis nostrud\nexercitation ullamco laboris nisi ut aliquip ex ea\ncommodo consequat.\"\n\n키케로의 원본 (기원전 45년):\n\"Neque porro quisquam est, qui dolorem ipsum quia\ndolor sit amet, consectetur, adipisci velit...\"\n(\"고통 그 자체를 사랑하고, 추구하고, 갖고 싶어하는\n사람은 아무도 없다, 단지 그것이 고통이라는\n이유만으로...\")" },
          { type: "heading", text: "플레이스홀더 텍스트 사용 모범 사례" },
          { type: "list", items: [
            "가능하면 최종 콘텐츠의 대략적인 길이와 맞추세요",
            "레이아웃 유연성을 테스트하기 위해 다양한 문단 길이를 사용하세요",
            "모든 콘텐츠 유형을 테스트하기 위해 제목, 목록 등 서식을 포함하세요",
            "출시 전에 플레이스홀더 텍스트를 교체하세요 — 배포 전 코드베이스에서 \"lorem\" 검색",
            "메시지가 중요한 경우 콘텐츠 우선 디자인을 고려하세요",
          ] },
          { type: "faq", faqItems: [
            { question: "Lorem Ipsum은 진짜 라틴어인가요?", answer: "부분적으로 그렇습니다. 키케로(기원전 45년)의 실제 라틴어 텍스트를 기반으로 하지만, 표준 구절은 수세기에 걸쳐 단어가 변경, 추가, 제거되었습니다. 읽을 수 있는 라틴어가 아니라 순전히 시각적 목적입니다." },
            { question: "플레이스홀더로 그냥 한국어 텍스트를 쓰면 안 되나요?", answer: "읽을 수 있는 언어는 산만합니다 — 사람들은 자연스럽게 디자인에 집중하는 대신 내용을 읽고 평가하기 시작합니다. Lorem Ipsum은 실제 텍스트처럼 보이지만 이러한 산만함을 방지하여 레이아웃과 타이포그래피에 집중하게 합니다." },
            { question: "Lorem Ipsum이 SEO에 영향을 줄 수 있나요?", answer: "네, 부정적으로 영향을 줍니다. Lorem Ipsum 텍스트가 포함된 페이지를 절대 게시하지 마세요. 검색 엔진이 얇거나 품질이 낮은 콘텐츠로 표시할 수 있습니다. 게시 전에 모든 플레이스홀더 텍스트를 실제 의미 있는 콘텐츠로 교체하세요." },
            { question: "목업에 Lorem Ipsum을 얼마나 생성해야 하나요?", answer: "예상 콘텐츠 길이에 맞추세요. 블로그 글은 300-500단어, 랜딩 페이지는 섹션당 100-200단어, 제품 설명은 50-100단어를 생성하세요. 레이아웃 적응성을 테스트하기 위해 섹션마다 다양한 길이를 사용하세요." },
          ] },
        ],
      },
    },
    relatedTools: [
      { slug: "lorem-ipsum-generator", name: { en: "Lorem Ipsum Generator", ko: "Lorem Ipsum 생성기" } },
      { slug: "word-counter", name: { en: "Word Counter", ko: "글자수 세기" } },
    ],
    relatedPosts: ["how-to-count-words-in-essay", "text-case-conversion-guide"],
  },
  {
    slug: "emergency-fund-calculator-guide",
    category: "finance",
    date: "2026-02-03",
    readingTime: 6,
    thumbnailAlt: {
      en: "A piggy bank with an emergency savings fund chart and safety net illustration",
      ko: "비상 저축 기금 차트와 안전망 일러스트가 있는 저금통",
    },
    translations: {
      en: {
        title: "Emergency Fund Calculator: How Much Should You Save",
        summary:
          "Learn how to calculate the right emergency fund size for your situation. Step-by-step guide with formulas, strategies, and tips for building your financial safety net.",
        content: [
          { type: "paragraph", text: "An emergency fund is the foundation of financial security. It's money set aside to cover unexpected expenses — job loss, medical emergencies, car repairs, or home maintenance. Without one, a single financial shock can spiral into debt, stress, and long-term financial damage." },
          { type: "heading", text: "How Much Do You Need?" },
          { type: "paragraph", text: "The standard advice is to save 3-6 months of essential expenses, but your ideal amount depends on your personal circumstances. Here's a step-by-step approach to calculate your target:" },
          { type: "code", language: "text", code: "Emergency Fund Calculator:\n\nStep 1: Calculate Monthly Essential Expenses\n  Rent/Mortgage:     $1,500\n  Utilities:         $200\n  Groceries:         $400\n  Insurance:         $300\n  Transportation:    $250\n  Minimum debt:      $350\n  ─────────────────────────\n  Total essentials:  $3,000/month\n\nStep 2: Choose Your Multiplier\n  Stable job, dual income:    3 months = $9,000\n  Single income, stable:      6 months = $18,000\n  Freelance/variable income:  9-12 months = $27,000-$36,000\n\nStep 3: Adjust for Personal Factors\n  + Add $1,000-2,000 for pet emergencies\n  + Add deductible amounts for health/auto insurance\n  + Add more if you own a home (repair fund)" },
          { type: "callout", text: "Key Takeaway: Start with a $1,000 mini emergency fund if you're in debt. Once high-interest debt is paid off, build up to 3-6 months of expenses. The perfect emergency fund is the one you actually have — any amount is better than zero." },
          { type: "heading", text: "Who Needs More Than 6 Months?" },
          { type: "list", items: [
            "Freelancers and self-employed workers with irregular income",
            "Single-income households with dependents",
            "People in industries with long job search timelines",
            "Homeowners (vs. renters) due to potential repair costs",
            "Those with chronic health conditions or high medical costs",
            "Workers in volatile industries or regions with high unemployment",
          ] },
          { type: "heading", text: "Where to Keep Your Emergency Fund" },
          { type: "paragraph", text: "Your emergency fund needs to be accessible but not too accessible. The ideal location balances liquidity, safety, and some return:" },
          { type: "list", items: [
            "High-yield savings account (HYSA) — best balance of access and returns (4-5% APY currently)",
            "Money market account — similar to HYSA with check-writing ability",
            "Short-term CDs (3-6 month) — slightly higher rates with planned access",
            "NOT in stocks, crypto, or investments — these can lose value when you need them most",
            "NOT under your mattress — you lose purchasing power to inflation",
          ] },
          { type: "heading", text: "How to Build Your Emergency Fund" },
          { type: "list", items: [
            "Set up automatic transfers — even $50/week adds up to $2,600/year",
            "Direct deposit splitting — have a portion of your paycheck go directly to savings",
            "Save windfalls — tax refunds, bonuses, gifts, and side income",
            "Cut one subscription temporarily and redirect that money",
            "Use the 50/30/20 budget — 20% for savings, emergency fund first",
            "Sell unused items — declutter and fund your safety net simultaneously",
          ] },
          { type: "heading", text: "When to Use Your Emergency Fund" },
          { type: "paragraph", text: "An emergency fund is for true emergencies only. Before dipping in, ask yourself: Is this unexpected? Is this necessary? Is this urgent? If the answer to all three is yes, it's likely a legitimate emergency." },
          { type: "list", items: [
            "YES: Job loss, medical emergencies, essential car/home repairs, unexpected travel for family emergency",
            "NO: Vacations, sales/deals, planned purchases, non-essential upgrades, investment opportunities",
          ] },
          { type: "faq", faqItems: [
            { question: "Is $1,000 enough for an emergency fund?", answer: "$1,000 is a great starter emergency fund, especially if you're paying off high-interest debt. However, it won't cover most major emergencies like job loss or significant medical bills. Work toward 3-6 months of expenses once your high-interest debt is under control." },
            { question: "Should I save for emergencies or pay off debt first?", answer: "Both. Start with a $1,000 mini emergency fund, then aggressively pay off high-interest debt (above 7-8%). Without any emergency fund, unexpected expenses will force you back into debt. Once high-interest debt is gone, build up to 3-6 months." },
            { question: "How long does it take to build a 6-month emergency fund?", answer: "It depends on your savings rate. Saving $500/month takes 3 years to reach $18,000. Saving $1,000/month takes 18 months. The key is consistency — automate your savings and treat it as a non-negotiable expense. Any progress is good progress." },
            { question: "Should I invest my emergency fund?", answer: "No. Emergency funds should be in safe, liquid accounts like high-yield savings accounts. Investing introduces the risk of loss at the worst possible time — market downturns often coincide with economic events that cause job losses. Keep your emergency fund boring and accessible." },
          ] },
        ],
      },
      ko: {
        title: "비상자금 계산기: 얼마를 모아야 할까",
        summary:
          "상황에 맞는 적절한 비상자금 규모를 계산하는 방법을 알아보세요. 공식, 전략, 재정적 안전망 구축 팁이 포함된 단계별 가이드입니다.",
        content: [
          { type: "paragraph", text: "비상자금은 재정 안정의 기초입니다. 실직, 의료 응급 상황, 차량 수리, 주택 유지보수 등 예상치 못한 지출을 충당하기 위해 마련해 둔 돈입니다. 비상자금이 없으면 하나의 재정적 충격이 부채, 스트레스, 장기적인 재정 피해로 이어질 수 있습니다." },
          { type: "heading", text: "얼마가 필요할까?" },
          { type: "paragraph", text: "일반적인 조언은 필수 지출 3-6개월분을 저축하는 것이지만, 이상적인 금액은 개인 상황에 따라 다릅니다. 목표 금액을 계산하는 단계별 방법입니다:" },
          { type: "code", language: "text", code: "비상자금 계산기:\n\n1단계: 월 필수 지출 계산\n  주거비(월세/대출):   100만원\n  공과금:             15만원\n  식비:               40만원\n  보험료:             20만원\n  교통비:             15만원\n  최소 부채 상환:      30만원\n  ─────────────────────────\n  총 필수 지출:       220만원/월\n\n2단계: 배수 선택\n  안정직장, 맞벌이:     3개월 = 660만원\n  외벌이, 안정직장:     6개월 = 1,320만원\n  프리랜서/변동소득:  9-12개월 = 1,980만-2,640만원\n\n3단계: 개인 요소 조정\n  + 반려동물 응급비 100-200만원\n  + 건강/자동차 보험 공제액\n  + 주택 소유 시 수리비 추가" },
          { type: "callout", text: "핵심 포인트: 부채가 있다면 100만원의 소규모 비상자금부터 시작하세요. 고금리 부채를 상환한 후 3-6개월분으로 늘리세요. 완벽한 비상자금은 실제로 가지고 있는 비상자금입니다 — 어떤 금액이든 없는 것보다 낫습니다." },
          { type: "heading", text: "6개월 이상이 필요한 사람" },
          { type: "list", items: [
            "불규칙한 소득의 프리랜서 및 자영업자",
            "부양가족이 있는 외벌이 가구",
            "구직 기간이 긴 업종 종사자",
            "수리 비용 가능성이 있는 주택 소유자",
            "만성 질환이나 높은 의료비가 있는 사람",
            "불안정한 업종이나 높은 실업률 지역의 근로자",
          ] },
          { type: "heading", text: "비상자금을 어디에 보관할까?" },
          { type: "paragraph", text: "비상자금은 접근 가능하되 너무 쉽게 쓸 수 없어야 합니다. 유동성, 안전성, 일정 수익의 균형이 이상적입니다:" },
          { type: "list", items: [
            "고금리 저축 계좌 — 접근성과 수익의 최적 균형",
            "CMA(종합자산관리계좌) — 수시 입출금 가능, 은행 예금보다 높은 금리",
            "단기 정기예금(3-6개월) — 약간 높은 금리, 계획된 접근",
            "주식, 암호화폐, 투자에 넣지 마세요 — 필요할 때 가치가 하락할 수 있음",
            "현금으로 보관하지 마세요 — 인플레이션으로 구매력 손실",
          ] },
          { type: "heading", text: "비상자금 만드는 방법" },
          { type: "list", items: [
            "자동 이체 설정 — 주 5만원도 연 260만원이 됩니다",
            "급여 분할 입금 — 급여의 일부를 바로 저축 계좌로",
            "임시 소득 저축 — 보너스, 선물, 부업 수입",
            "구독 하나를 일시적으로 해지하고 그 금액을 저축으로",
            "50/30/20 예산법 — 20%를 저축에, 비상자금 우선",
            "안 쓰는 물건 판매 — 정리하면서 동시에 안전망 구축",
          ] },
          { type: "heading", text: "비상자금을 사용해야 할 때" },
          { type: "paragraph", text: "비상자금은 진정한 비상 상황에만 사용해야 합니다. 사용 전에 스스로에게 물어보세요: 예상치 못한 것인가? 꼭 필요한 것인가? 긴급한 것인가? 세 가지 모두 '예'라면 정당한 비상 상황일 가능성이 높습니다." },
          { type: "list", items: [
            "사용 O: 실직, 의료 응급, 필수 차량/주택 수리, 가족 비상 상황",
            "사용 X: 여행, 세일/할인, 계획된 구매, 비필수 업그레이드, 투자 기회",
          ] },
          { type: "faq", faqItems: [
            { question: "100만원이면 비상자금으로 충분한가요?", answer: "100만원은 훌륭한 초기 비상자금이며, 특히 고금리 부채를 상환 중일 때 좋습니다. 하지만 실직이나 큰 의료비 같은 주요 비상 상황을 감당하기에는 부족합니다. 고금리 부채가 정리되면 3-6개월분으로 늘리세요." },
            { question: "비상자금 저축과 부채 상환 중 어떤 것을 먼저 해야 하나요?", answer: "둘 다 하세요. 먼저 100만원의 소규모 비상자금을 만들고, 그 다음 고금리 부채(7-8% 이상)를 적극적으로 상환하세요. 비상자금이 전혀 없으면 예상치 못한 지출이 다시 부채로 이어집니다." },
            { question: "6개월분 비상자금을 만드는 데 얼마나 걸리나요?", answer: "저축률에 따라 다릅니다. 월 50만원 저축 시 1,320만원 모으는 데 약 2년 2개월이 걸립니다. 월 100만원이면 약 1년 1개월입니다. 핵심은 일관성입니다 — 저축을 자동화하고 필수 지출로 취급하세요." },
            { question: "비상자금을 투자해야 하나요?", answer: "아닙니다. 비상자금은 고금리 저축 계좌나 CMA 같은 안전하고 유동적인 계좌에 보관해야 합니다. 투자는 최악의 시기에 손실 위험을 수반합니다 — 경기 침체기에 실직이 발생하는 경우가 많습니다. 비상자금은 지루하지만 접근 가능하게 유지하세요." },
          ] },
        ],
      },
    },
    relatedTools: [
      { slug: "word-counter", name: { en: "Word Counter", ko: "글자수 세기" } },
    ],
    relatedPosts: ["compound-interest-calculator-guide", "retirement-savings-calculator-guide", "mortgage-calculator-guide"],
  },
  {
    slug: "age-calculator-guide",
    category: "lifestyle",
    date: "2026-01-30",
    readingTime: 5,
    thumbnailAlt: {
      en: "A calendar showing age calculation with years, months, and days highlighted",
      ko: "년, 월, 일이 강조 표시된 나이 계산 달력",
    },
    translations: {
      en: {
        title: "Age Calculator: How to Calculate Exact Age in Years, Months, Days",
        summary:
          "Learn how to calculate exact age down to years, months, and days. Understand different age counting systems around the world and practical uses for precise age calculations.",
        content: [
          { type: "paragraph", text: "Calculating your exact age seems simple — just subtract your birth year from the current year, right? But precise age calculation is more nuanced than that. Whether you need it for legal documents, medical records, or personal milestones, knowing your exact age in years, months, and days matters." },
          { type: "heading", text: "How Age Calculation Works" },
          { type: "paragraph", text: "To calculate your exact age, you need to account for the difference between your birth date and today's date across three units: years, months, and days. This is more complex than simple subtraction because months have different lengths and leap years add an extra day." },
          { type: "code", language: "text", code: "Age Calculation Example:\n\n  Birth date:   March 15, 1990\n  Today's date: March 8, 2026\n\n  Step 1: Years\n    2026 - 1990 = 36\n    But March 8 < March 15, so: 35 complete years\n\n  Step 2: Months\n    From March 15, 2025 to March 8, 2026\n    = 11 months and some days\n\n  Step 3: Days\n    From Feb 15 to March 8 = 21 days\n\n  Result: 35 years, 11 months, 21 days\n\n  Total days alive: ~13,142 days\n  Next birthday in: 7 days!" },
          { type: "heading", text: "Age Counting Systems Around the World" },
          { type: "paragraph", text: "Different cultures count age differently, which can lead to confusion in international contexts:" },
          { type: "list", items: [
            "Western system — Age starts at 0 at birth, increases on each birthday",
            "Korean age (만 나이 vs 세는 나이) — Korea officially switched to the international age system (만 나이) in June 2023, ending the traditional system where babies were 1 at birth",
            "East Asian age (数え年) — Traditional system in Japan/China where you're 1 at birth and age increases on New Year's Day",
            "Lunar calendar age — Some cultures calculate age based on lunar calendar birthdays",
          ] },
          { type: "callout", text: "Key Takeaway: Since June 2023, South Korea officially uses the international age system (만 나이) for all legal and administrative purposes. This means Koreans are now 1-2 years 'younger' in official documents compared to the old system." },
          { type: "heading", text: "When Exact Age Matters" },
          { type: "list", items: [
            "Legal purposes — voting age, drinking age, retirement age, contract eligibility",
            "Medical records — pediatric development milestones, vaccination schedules, age-adjusted health metrics",
            "Insurance — premiums change at specific ages, often calculated to the day",
            "Education — school enrollment cutoff dates vary by country and state",
            "Sports — age group classifications for competitions",
            "Immigration — visa and citizenship eligibility often depends on exact age",
          ] },
          { type: "heading", text: "Interesting Age-Related Facts" },
          { type: "list", items: [
            "A billion seconds old = approximately 31 years, 8 months",
            "10,000 days old ≈ 27 years, 4 months",
            "Leap year babies (Feb 29) legally celebrate on Feb 28 or March 1 in non-leap years",
            "The oldest verified person lived 122 years and 164 days",
            "Your 'golden birthday' is when your age matches your birth date (e.g., turning 15 on the 15th)",
          ] },
          { type: "heading", text: "Age Calculation Tips" },
          { type: "paragraph", text: "When calculating age manually, remember that you haven't completed a year until your birthday has passed. If today is before your birthday this year, subtract one from the year difference. For precise calculations involving months and days, work backwards from today to your last birthday." },
          { type: "faq", faqItems: [
            { question: "How do I calculate my exact age in days?", answer: "Count the total number of days from your birth date to today. Remember to account for leap years (years divisible by 4, except centuries not divisible by 400). A quick estimate: multiply your age by 365.25 (average days per year including leap years)." },
            { question: "What is Korean age vs. international age?", answer: "Korean traditional age (세는 나이) counted everyone as 1 at birth and added a year on New Year's Day. Since June 28, 2023, Korea officially uses international age (만 나이), which starts at 0 and increases on your actual birthday, just like Western countries." },
            { question: "How do leap year birthdays work?", answer: "If you're born on February 29, you technically have a birthday only every 4 years. Legally, most jurisdictions treat March 1 as your birthday in non-leap years. Some countries use February 28. For age calculation, you still age normally — you don't stay younger!" },
            { question: "At what exact moment do you turn a year older?", answer: "Legally, in most countries you turn a year older at the start of your birthday (midnight). Some jurisdictions consider you a year older the day before your birthday. For most practical purposes, your birthday is when your age increases by one year." },
          ] },
        ],
      },
      ko: {
        title: "만나이 계산기: 정확한 나이 계산하는 방법",
        summary:
          "년, 월, 일 단위까지 정확한 나이를 계산하는 방법을 알아보세요. 전 세계의 다양한 나이 계산 체계와 정확한 나이 계산의 실용적 활용법을 설명합니다.",
        content: [
          { type: "paragraph", text: "정확한 나이를 계산하는 것은 간단해 보입니다 — 현재 연도에서 출생 연도를 빼면 되지 않나요? 하지만 정밀한 나이 계산은 그보다 복잡합니다. 법적 서류, 의료 기록, 개인적인 이정표 등 정확한 나이를 년, 월, 일 단위로 아는 것이 중요한 경우가 많습니다." },
          { type: "heading", text: "나이 계산 방법" },
          { type: "paragraph", text: "정확한 나이를 계산하려면 생년월일과 오늘 날짜 사이의 차이를 년, 월, 일 세 단위로 계산해야 합니다. 월마다 일수가 다르고 윤년에 하루가 추가되기 때문에 단순 뺄셈보다 복잡합니다." },
          { type: "code", language: "text", code: "나이 계산 예시:\n\n  생년월일:    1990년 3월 15일\n  오늘 날짜:   2026년 3월 8일\n\n  1단계: 년\n    2026 - 1990 = 36\n    하지만 3월 8일 < 3월 15일이므로: 만 35세\n\n  2단계: 월\n    2025년 3월 15일부터 2026년 3월 8일까지\n    = 11개월과 며칠\n\n  3단계: 일\n    2월 15일부터 3월 8일 = 21일\n\n  결과: 만 35세 11개월 21일\n\n  살아온 총 일수: 약 13,142일\n  다음 생일까지: 7일!" },
          { type: "heading", text: "전 세계의 나이 계산 체계" },
          { type: "paragraph", text: "문화마다 나이를 다르게 계산하며, 이는 국제적 맥락에서 혼란을 일으킬 수 있습니다:" },
          { type: "list", items: [
            "서양식 — 태어날 때 0세, 매 생일에 1세 증가",
            "한국 나이 (만 나이 vs 세는 나이) — 2023년 6월 한국은 공식적으로 만 나이 체계로 전환, 태어날 때 1세이던 전통 방식 폐지",
            "동아시아 나이 (数え年) — 일본/중국의 전통 체계, 태어날 때 1세이고 설날에 나이 증가",
            "음력 나이 — 일부 문화에서는 음력 생일을 기준으로 나이 계산",
          ] },
          { type: "callout", text: "핵심 포인트: 2023년 6월부터 한국은 모든 법적, 행정적 목적에 만 나이를 공식 사용합니다. 이로 인해 한국인들은 공식 문서에서 이전 체계보다 1-2세 '젊어'졌습니다." },
          { type: "heading", text: "정확한 나이가 중요한 경우" },
          { type: "list", items: [
            "법적 목적 — 선거권, 음주 가능 나이, 정년, 계약 자격",
            "의료 기록 — 소아 발달 이정표, 예방접종 일정, 나이 보정 건강 지표",
            "보험 — 보험료가 특정 나이에 변경, 일 단위로 계산되기도 함",
            "교육 — 취학 연령 기준일이 국가와 지역에 따라 다름",
            "스포츠 — 대회 연령 그룹 분류",
            "출입국 — 비자 및 시민권 자격이 정확한 나이에 의존하는 경우",
          ] },
          { type: "heading", text: "나이와 관련된 흥미로운 사실" },
          { type: "list", items: [
            "10억 초 = 약 31년 8개월",
            "10,000일 ≈ 약 27년 4개월",
            "윤년 생일자(2월 29일)는 비윤년에 법적으로 2월 28일이나 3월 1일에 생일 축하",
            "검증된 최고령자는 122세 164일을 살았습니다",
            "'골든 생일'은 나이가 생일 날짜와 같을 때 (예: 15일에 15세 됨)",
          ] },
          { type: "heading", text: "나이 계산 팁" },
          { type: "paragraph", text: "수동으로 나이를 계산할 때, 올해 생일이 지나야 한 해가 완성된다는 점을 기억하세요. 오늘이 올해 생일 전이면 연도 차이에서 1을 빼세요. 월과 일을 포함한 정밀 계산은 오늘부터 마지막 생일까지 역산하는 방식으로 하세요." },
          { type: "faq", faqItems: [
            { question: "정확한 나이를 일 단위로 어떻게 계산하나요?", answer: "생년월일부터 오늘까지의 총 일수를 세세요. 윤년(4로 나누어지는 해, 단 400으로 나누어지지 않는 세기 제외)을 고려하세요. 빠른 추정: 나이에 365.25(윤년 포함 연평균 일수)를 곱하세요." },
            { question: "한국 나이와 만 나이의 차이는?", answer: "한국 전통 나이(세는 나이)는 태어날 때 1세, 매년 1월 1일에 1세 증가했습니다. 2023년 6월 28일부터 한국은 만 나이를 공식 사용합니다. 만 나이는 0세에서 시작하고 실제 생일에 1세 증가하며, 서양식과 동일합니다." },
            { question: "윤년 생일은 어떻게 되나요?", answer: "2월 29일에 태어나면 기술적으로 4년에 한 번만 생일이 있습니다. 법적으로 대부분의 국가에서는 비윤년에 3월 1일을 생일로 취급합니다. 일부 국가는 2월 28일을 사용합니다. 나이 계산에서는 정상적으로 나이가 들어갑니다." },
            { question: "정확히 몇 시에 한 살 더 먹나요?", answer: "법적으로 대부분의 국가에서는 생일 시작(자정)에 한 살 더 먹습니다. 일부 법적 관할 구역에서는 생일 전날에 한 살 더 먹는 것으로 간주합니다. 대부분의 실용적 목적에서는 생일이 나이가 1세 증가하는 날입니다." },
          ] },
        ],
      },
    },
    relatedTools: [
      { slug: "word-counter", name: { en: "Word Counter", ko: "글자수 세기" } },
    ],
    relatedPosts: ["bmi-calculator-guide", "calorie-calculator-guide"],
  },
  {
    slug: "calorie-calculator-guide",
    category: "lifestyle",
    date: "2026-01-27",
    readingTime: 7,
    thumbnailAlt: {
      en: "A plate of food with calorie counts and a daily nutrition breakdown chart",
      ko: "칼로리 수치와 일일 영양 분석 차트가 있는 음식 접시",
    },
    translations: {
      en: {
        title: "Calorie Calculator: How Many Calories Do You Need Per Day",
        summary:
          "Learn how to calculate your daily calorie needs using BMR and TDEE formulas. Understand calorie counting for weight loss, maintenance, and muscle gain with practical examples.",
        content: [
          { type: "paragraph", text: "Understanding your daily calorie needs is the foundation of nutrition management. Whether you want to lose weight, maintain your current weight, or build muscle, knowing how many calories your body needs is the first step toward achieving your goals." },
          { type: "heading", text: "What Are Calories?" },
          { type: "paragraph", text: "A calorie (technically a kilocalorie or kcal) is a unit of energy. Your body uses calories from food to power everything from breathing and thinking to running and lifting. When you consume more calories than you burn, the excess is stored as fat. When you consume fewer, your body taps into stored fat for energy." },
          { type: "heading", text: "How to Calculate Your Daily Calorie Needs" },
          { type: "paragraph", text: "Your daily calorie needs are determined in two steps: first calculate your Basal Metabolic Rate (BMR), then multiply by an activity factor to get your Total Daily Energy Expenditure (TDEE)." },
          { type: "code", language: "text", code: "Step 1: Calculate BMR (Mifflin-St Jeor Equation)\n\n  Men:   BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5\n  Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161\n\n  Example (30-year-old male, 75kg, 178cm):\n  BMR = (10 × 75) + (6.25 × 178) - (5 × 30) + 5\n  BMR = 750 + 1,112.5 - 150 + 5 = 1,717.5 kcal/day\n\nStep 2: Multiply by Activity Factor (TDEE)\n\n  Sedentary (desk job):          BMR × 1.2  = 2,061 kcal\n  Lightly active (1-3 days/wk):  BMR × 1.375 = 2,362 kcal\n  Moderately active (3-5 days):  BMR × 1.55 = 2,662 kcal\n  Very active (6-7 days):        BMR × 1.725 = 2,963 kcal\n  Extremely active (athlete):    BMR × 1.9  = 3,263 kcal" },
          { type: "callout", text: "Key Takeaway: Your TDEE is the number of calories you need to maintain your current weight. To lose weight, eat 300-500 calories below TDEE. To gain muscle, eat 200-300 calories above TDEE. Never go below 1,200 kcal (women) or 1,500 kcal (men) without medical supervision." },
          { type: "heading", text: "Calorie Goals by Objective" },
          { type: "list", items: [
            "Weight loss: TDEE minus 300-500 kcal/day (0.3-0.5 kg loss per week)",
            "Aggressive weight loss: TDEE minus 500-750 kcal/day (0.5-0.75 kg per week, not recommended long-term)",
            "Weight maintenance: Eat at TDEE",
            "Lean muscle gain: TDEE plus 200-300 kcal/day with strength training",
            "Bulk muscle gain: TDEE plus 400-500 kcal/day with heavy training",
          ] },
          { type: "heading", text: "Macronutrient Balance" },
          { type: "paragraph", text: "Calories alone don't tell the whole story. The source of your calories matters too. A balanced approach to macronutrients supports both energy and health:" },
          { type: "list", items: [
            "Protein: 1.6-2.2g per kg of body weight for active individuals (4 kcal per gram)",
            "Fat: 20-35% of total calories (9 kcal per gram) — essential for hormones and vitamin absorption",
            "Carbohydrates: Remaining calories after protein and fat (4 kcal per gram) — primary energy source",
            "Example (2,500 kcal diet, 75kg person): 150g protein (600 kcal), 70g fat (630 kcal), 318g carbs (1,270 kcal)",
          ] },
          { type: "heading", text: "Common Calorie Counting Mistakes" },
          { type: "list", items: [
            "Not counting cooking oils and sauces (a tablespoon of oil = 120 kcal)",
            "Underestimating portion sizes — use a food scale for accuracy",
            "Forgetting liquid calories (coffee drinks, smoothies, alcohol)",
            "Eating back exercise calories — fitness trackers often overestimate burns",
            "Being too restrictive — extreme deficits slow metabolism and cause rebound",
            "Not adjusting as weight changes — recalculate TDEE every 5-10 kg lost",
          ] },
          { type: "heading", text: "Practical Tips for Daily Calorie Management" },
          { type: "list", items: [
            "Track for at least 2 weeks to understand your eating patterns",
            "Meal prep to control portions and ingredients",
            "Focus on nutrient-dense foods — vegetables, lean protein, whole grains",
            "Drink water before meals — sometimes thirst masquerades as hunger",
            "Allow flexibility — an 80/20 approach (80% nutritious, 20% enjoyment) is sustainable",
            "Adjust based on results, not just calculations — bodies are individual",
          ] },
          { type: "faq", faqItems: [
            { question: "How many calories should I eat to lose weight?", answer: "Subtract 300-500 calories from your TDEE for steady, sustainable weight loss of 0.3-0.5 kg per week. For example, if your TDEE is 2,200 kcal, aim for 1,700-1,900 kcal per day. Avoid going below 1,200 kcal (women) or 1,500 kcal (men) without medical supervision." },
            { question: "Do I need to count calories forever?", answer: "No. Calorie counting is a learning tool. After tracking for a few weeks to months, most people develop a good sense of portion sizes and calorie content. Many successfully transition to intuitive eating while maintaining their weight goals. Periodic tracking can help if you plateau or drift." },
            { question: "Are all calories equal?", answer: "Thermodynamically yes, but nutritionally no. 200 calories of chicken breast provides lasting satiety and muscle-building protein, while 200 calories of candy provides quick energy and a crash. The quality of calories affects hunger, energy levels, muscle retention, and long-term health." },
            { question: "Why am I not losing weight even though I'm counting calories?", answer: "Common reasons include: underestimating portions (use a food scale), not counting cooking oils or sauces, drinking hidden calories, your TDEE may be lower than calculated, or metabolic adaptation from prolonged dieting. Try recalculating your TDEE at your current weight and tracking more precisely for a week." },
          ] },
        ],
      },
      ko: {
        title: "칼로리 계산기: 하루에 몇 칼로리가 필요할까",
        summary:
          "BMR과 TDEE 공식을 사용하여 일일 칼로리 필요량을 계산하는 방법을 알아보세요. 체중 감량, 유지, 근육 증가를 위한 칼로리 계산을 실용 예시와 함께 설명합니다.",
        content: [
          { type: "paragraph", text: "일일 칼로리 필요량을 이해하는 것은 영양 관리의 기초입니다. 체중 감량, 현재 체중 유지, 근육 증가 등 어떤 목표든 몸이 필요로 하는 칼로리를 아는 것이 목표 달성의 첫걸음입니다." },
          { type: "heading", text: "칼로리란?" },
          { type: "paragraph", text: "칼로리(정확히는 킬로칼로리, kcal)는 에너지의 단위입니다. 몸은 음식의 칼로리를 사용하여 호흡과 사고부터 달리기와 역기 들기까지 모든 것을 수행합니다. 소비한 칼로리가 태운 것보다 많으면 초과분이 지방으로 저장됩니다. 적으면 몸이 저장된 지방을 에너지로 사용합니다." },
          { type: "heading", text: "일일 칼로리 필요량 계산 방법" },
          { type: "paragraph", text: "일일 칼로리 필요량은 두 단계로 결정됩니다: 먼저 기초대사량(BMR)을 계산한 다음, 활동 계수를 곱하여 총 일일 에너지 소비량(TDEE)을 구합니다." },
          { type: "code", language: "text", code: "1단계: BMR 계산 (미플린-세인트 지오어 공식)\n\n  남성: BMR = (10 × 체중kg) + (6.25 × 키cm) - (5 × 나이) + 5\n  여성: BMR = (10 × 체중kg) + (6.25 × 키cm) - (5 × 나이) - 161\n\n  예시 (30세 남성, 75kg, 178cm):\n  BMR = (10 × 75) + (6.25 × 178) - (5 × 30) + 5\n  BMR = 750 + 1,112.5 - 150 + 5 = 1,717.5 kcal/일\n\n2단계: 활동 계수 곱하기 (TDEE)\n\n  비활동적 (사무직):           BMR × 1.2  = 2,061 kcal\n  약간 활동적 (주 1-3일):      BMR × 1.375 = 2,362 kcal\n  보통 활동적 (주 3-5일):      BMR × 1.55 = 2,662 kcal\n  매우 활동적 (주 6-7일):      BMR × 1.725 = 2,963 kcal\n  극도로 활동적 (운동선수):     BMR × 1.9  = 3,263 kcal" },
          { type: "callout", text: "핵심 포인트: TDEE는 현재 체중을 유지하는 데 필요한 칼로리입니다. 체중 감량은 TDEE보다 300-500kcal 적게, 근육 증가는 200-300kcal 많게 섭취하세요. 의료 감독 없이 여성 1,200kcal, 남성 1,500kcal 이하로 내리지 마세요." },
          { type: "heading", text: "목표별 칼로리" },
          { type: "list", items: [
            "체중 감량: TDEE - 300-500kcal/일 (주 0.3-0.5kg 감량)",
            "적극적 감량: TDEE - 500-750kcal/일 (주 0.5-0.75kg, 장기 비권장)",
            "체중 유지: TDEE만큼 섭취",
            "린 근육 증가: TDEE + 200-300kcal/일, 근력 운동 병행",
            "벌크 근육 증가: TDEE + 400-500kcal/일, 고강도 훈련 병행",
          ] },
          { type: "heading", text: "다량 영양소 균형" },
          { type: "paragraph", text: "칼로리만으로는 전체 그림을 볼 수 없습니다. 칼로리의 출처도 중요합니다. 균형 잡힌 다량 영양소 접근법이 에너지와 건강 모두를 지원합니다:" },
          { type: "list", items: [
            "단백질: 활동적인 사람 기준 체중 kg당 1.6-2.2g (1g당 4kcal)",
            "지방: 총 칼로리의 20-35% (1g당 9kcal) — 호르몬과 비타민 흡수에 필수",
            "탄수화물: 단백질과 지방 후 나머지 (1g당 4kcal) — 주요 에너지원",
            "예시 (2,500kcal 식단, 75kg): 단백질 150g(600kcal), 지방 70g(630kcal), 탄수화물 318g(1,270kcal)",
          ] },
          { type: "heading", text: "흔한 칼로리 계산 실수" },
          { type: "list", items: [
            "조리유와 소스를 세지 않기 (식용유 1큰술 = 120kcal)",
            "1인분 양 과소평가 — 정확도를 위해 음식 저울 사용",
            "액체 칼로리 잊기 (커피 음료, 스무디, 술)",
            "운동 칼로리를 되먹기 — 피트니스 트래커는 소모량을 과대평가하는 경우가 많음",
            "너무 제한적 — 극단적 적자는 대사를 늦추고 반동을 일으킴",
            "체중 변화에 따라 미조정 안 하기 — 5-10kg 감량마다 TDEE 재계산",
          ] },
          { type: "heading", text: "일일 칼로리 관리 실용 팁" },
          { type: "list", items: [
            "최소 2주 동안 기록하여 식사 패턴 파악",
            "식사 준비(밀프렙)로 분량과 재료 조절",
            "영양 밀도 높은 음식에 집중 — 채소, 저지방 단백질, 통곡물",
            "식사 전 물 마시기 — 갈증이 배고픔으로 위장되는 경우가 있음",
            "유연성 허용 — 80/20 접근법(80% 영양, 20% 즐거움)이 지속 가능",
            "계산이 아닌 결과에 따라 조정 — 몸은 개인마다 다름",
          ] },
          { type: "faq", faqItems: [
            { question: "체중 감량을 위해 하루에 몇 칼로리를 먹어야 하나요?", answer: "TDEE에서 300-500kcal을 빼면 주 0.3-0.5kg의 꾸준하고 지속 가능한 감량이 가능합니다. 예를 들어 TDEE가 2,200kcal이면 1,700-1,900kcal을 목표로 하세요. 의료 감독 없이 여성 1,200kcal, 남성 1,500kcal 이하로 내리지 마세요." },
            { question: "칼로리를 평생 세야 하나요?", answer: "아닙니다. 칼로리 계산은 학습 도구입니다. 몇 주에서 몇 달 기록하면 대부분 1인분 양과 칼로리 함량에 대한 감각이 생깁니다. 많은 사람이 체중 목표를 유지하면서 직관적 식사로 성공적으로 전환합니다." },
            { question: "모든 칼로리는 동일한가요?", answer: "열역학적으로는 그렇지만 영양적으로는 아닙니다. 닭가슴살 200kcal은 지속적인 포만감과 근육 생성 단백질을 제공하고, 사탕 200kcal은 빠른 에너지와 급격한 저하를 가져옵니다. 칼로리의 질이 배고픔, 에너지 수준, 근육 유지, 장기 건강에 영향을 줍니다." },
            { question: "칼로리를 세는데 왜 체중이 안 빠지나요?", answer: "흔한 이유: 1인분 과소평가(음식 저울 사용), 조리유/소스 미계산, 숨겨진 액체 칼로리, TDEE가 계산보다 낮음, 장기 다이어트로 인한 대사 적응. 현재 체중으로 TDEE를 재계산하고 1주일간 더 정밀하게 추적해보세요." },
          ] },
        ],
      },
    },
    relatedTools: [
      { slug: "word-counter", name: { en: "Word Counter", ko: "글자수 세기" } },
    ],
    relatedPosts: ["bmi-calculator-guide", "age-calculator-guide"],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogCategory | "all"): BlogPost[] {
  if (category === "all") return blogPosts;
  return blogPosts.filter((p) => p.category === category);
}

export function getPaginatedPosts(
  posts: BlogPost[],
  page: number
): { posts: BlogPost[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const start = (page - 1) * POSTS_PER_PAGE;
  return { posts: posts.slice(start, start + POSTS_PER_PAGE), totalPages };
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
