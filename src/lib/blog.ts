import type { Locale } from "./dictionaries";

export type BlogCategory = "text-tools" | "developer-tools" | "generators";

export interface ContentBlock {
  type: "paragraph" | "heading" | "code" | "list" | "callout" | "cta";
  text?: string;
  items?: string[];
  language?: string;
  code?: string;
  tool?: string;
  toolName?: string;
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
    relatedPosts: ["text-case-conversion-guide", "lorem-ipsum-history-and-usage"],
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
    relatedPosts: ["understanding-base64-encoding", "how-to-create-strong-passwords"],
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
    relatedPosts: ["understanding-base64-encoding", "json-formatting-best-practices"],
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
    relatedPosts: ["how-to-count-words-in-essay", "json-formatting-best-practices"],
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
