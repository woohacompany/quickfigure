import type { ToolContentData } from "./tool-content";

export const devTextToolContent: Record<string, ToolContentData> = {
  // ─────────────────────────────────────────────
  // DEV TOOLS
  // ─────────────────────────────────────────────

  "json-formatter": {
    about: {
      en: "JSON Formatter is a developer tool that validates, formats, and minifies JSON data instantly in your browser. It supports tree-view visualization, customizable indentation (2/4 spaces or tabs), and syntax highlighting. Ideal for API developers, backend engineers, and anyone working with JSON configuration files.",
      ko: "JSON 포맷터는 브라우저에서 JSON 데이터를 즉시 검증, 정렬, 압축할 수 있는 개발자 도구입니다. 트리뷰 시각화, 들여쓰기 설정(2/4 스페이스 또는 탭), 구문 강조 기능을 지원합니다. API 개발자, 백엔드 엔지니어, JSON 설정 파일을 다루는 모든 분에게 유용합니다."
    },
    howItWorks: {
      en: "JSON (JavaScript Object Notation) is a lightweight data-interchange format defined by RFC 8259. When you paste raw JSON into this tool, it first runs a full parse using a recursive-descent parser that builds an Abstract Syntax Tree (AST). If the input contains syntax errors — such as trailing commas, unquoted keys, or mismatched brackets — the parser pinpoints the exact line and column of the error.\n\nOnce the AST is validated, the formatter re-serializes it with the indentation level you choose. The \"beautify\" mode inserts newlines and spaces at each nesting level for human readability. The \"minify\" mode strips all unnecessary whitespace, producing the smallest possible output for network transfer. The tree-view mode renders the AST as a collapsible hierarchical structure, letting you expand and collapse nested objects and arrays interactively.",
      ko: "JSON(JavaScript Object Notation)은 RFC 8259로 정의된 경량 데이터 교환 형식입니다. 이 도구에 원시 JSON을 붙여넣으면, 재귀 하강 파서를 사용해 추상 구문 트리(AST)를 구축하며 전체 파싱을 수행합니다. 후행 쉼표, 따옴표 없는 키, 괄호 불일치 등의 구문 오류가 있으면 정확한 행과 열 위치를 표시합니다.\n\nAST 검증이 완료되면 선택한 들여쓰기 수준으로 다시 직렬화합니다. '정렬' 모드는 각 중첩 레벨에 줄바꿈과 공백을 삽입하여 가독성을 높입니다. '압축' 모드는 불필요한 공백을 모두 제거하여 네트워크 전송에 최적화된 최소 크기의 출력을 생성합니다. 트리뷰 모드는 AST를 접고 펼 수 있는 계층 구조로 렌더링하여 중첩된 객체와 배열을 대화형으로 탐색할 수 있게 해줍니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  "base64-encoder-decoder": {
    about: {
      en: "Base64 Encoder/Decoder converts text or binary data to and from Base64 encoding directly in your browser. It supports standard Base64 (RFC 4648) and URL-safe Base64 variants. Perfect for developers working with APIs, email attachments (MIME), data URIs, or JWT tokens.",
      ko: "Base64 인코더/디코더는 텍스트 또는 바이너리 데이터를 브라우저에서 직접 Base64로 인코딩하거나 디코딩하는 도구입니다. 표준 Base64(RFC 4648)와 URL-safe Base64 변형을 모두 지원합니다. API, 이메일 첨부(MIME), 데이터 URI, JWT 토큰을 다루는 개발자에게 필수적인 도구입니다."
    },
    howItWorks: {
      en: "Base64 encoding converts binary data into a set of 64 printable ASCII characters (A-Z, a-z, 0-9, +, /), plus '=' for padding. The algorithm takes the input byte stream and processes it in 3-byte (24-bit) groups. Each 24-bit group is split into four 6-bit segments, and each segment maps to one of the 64 characters in the Base64 alphabet.\n\nIf the input length is not a multiple of 3, the encoder pads the final group with zero bits and appends one or two '=' characters to signal the padding. This ensures the encoded output length is always a multiple of 4 characters. Decoding reverses this process: each Base64 character is mapped back to its 6-bit value, the bits are concatenated, and the original byte stream is reconstructed. URL-safe Base64 replaces '+' with '-' and '/' with '_' to avoid conflicts in URLs and filenames.",
      ko: "Base64 인코딩은 바이너리 데이터를 64개의 출력 가능한 ASCII 문자(A-Z, a-z, 0-9, +, /)로 변환하며, 패딩에는 '='를 사용합니다. 알고리즘은 입력 바이트 스트림을 3바이트(24비트) 그룹으로 처리합니다. 각 24비트 그룹은 4개의 6비트 세그먼트로 분할되고, 각 세그먼트는 Base64 알파벳의 64개 문자 중 하나에 매핑됩니다.\n\n입력 길이가 3의 배수가 아니면, 인코더는 마지막 그룹을 0비트로 채우고 '=' 문자를 1~2개 추가하여 패딩을 표시합니다. 이를 통해 인코딩된 출력 길이가 항상 4의 배수가 됩니다. 디코딩은 이 과정을 역순으로 수행합니다: 각 Base64 문자를 6비트 값으로 매핑하고, 비트를 연결하여 원본 바이트 스트림을 복원합니다. URL-safe Base64는 URL과 파일명에서의 충돌을 방지하기 위해 '+'를 '-'로, '/'를 '_'로 대체합니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  "password-generator": {
    about: {
      en: "Password Generator creates strong, random passwords with customizable length and character sets — including uppercase, lowercase, digits, and special symbols. It calculates password entropy in real time so you can gauge the strength of each generated password. Essential for anyone who needs secure credentials for accounts, APIs, or database access.",
      ko: "비밀번호 생성기는 대문자, 소문자, 숫자, 특수문자를 조합하여 강력하고 무작위한 비밀번호를 생성합니다. 생성된 비밀번호의 엔트로피를 실시간으로 계산하여 보안 강도를 즉시 확인할 수 있습니다. 계정, API, 데이터베이스 접근에 안전한 자격 증명이 필요한 모든 분에게 필수적인 도구입니다."
    },
    howItWorks: {
      en: "This tool uses the Web Crypto API's `crypto.getRandomValues()` to generate cryptographically secure random numbers, which are far superior to `Math.random()` for security purposes. The algorithm builds a character pool based on your selections (uppercase A-Z, lowercase a-z, digits 0-9, special symbols), then picks characters uniformly at random from that pool for each position in the password.\n\nPassword strength is measured in bits of entropy, calculated as: entropy = length x log2(pool size). For example, a 16-character password drawn from a pool of 94 characters (all printable ASCII) yields approximately 104.8 bits of entropy. NIST guidelines recommend a minimum of 80 bits for high-security applications. The tool also checks against common patterns — sequential characters, repeated characters, and dictionary words — to ensure the generated password resists both brute-force and dictionary attacks.",
      ko: "이 도구는 Web Crypto API의 `crypto.getRandomValues()`를 사용하여 암호학적으로 안전한 난수를 생성합니다. 이는 보안 측면에서 `Math.random()`보다 훨씬 우수합니다. 알고리즘은 선택한 옵션(대문자 A-Z, 소문자 a-z, 숫자 0-9, 특수문자)으로 문자 풀을 구성한 뒤, 비밀번호의 각 자리에 해당 풀에서 균등하게 무작위 문자를 선택합니다.\n\n비밀번호 강도는 엔트로피(비트)로 측정되며, 공식은 엔트로피 = 길이 x log2(풀 크기)입니다. 예를 들어 94개 문자(출력 가능한 모든 ASCII)로 구성된 16자리 비밀번호는 약 104.8비트의 엔트로피를 갖습니다. NIST 가이드라인은 고보안 애플리케이션에 최소 80비트를 권장합니다. 또한 연속 문자, 반복 문자, 사전 단어 등 흔한 패턴을 검사하여 무차별 대입 공격과 사전 공격 모두에 대한 저항력을 보장합니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  "regex-tester": {
    about: {
      en: "Regex Tester lets you write, test, and debug regular expressions with real-time matching and highlighting against your test strings. It supports all JavaScript regex flags (g, i, m, s, u, y) and displays match groups, indices, and captured subgroups. A must-have for developers building input validation, data extraction, or search-and-replace logic.",
      ko: "정규표현식 테스터는 정규표현식을 작성하고 테스트 문자열에 대해 실시간 매칭 및 하이라이팅을 수행할 수 있는 도구입니다. 모든 JavaScript 정규식 플래그(g, i, m, s, u, y)를 지원하며, 매칭 그룹, 인덱스, 캡처된 하위 그룹을 표시합니다. 입력 검증, 데이터 추출, 검색-치환 로직을 개발하는 개발자에게 필수적인 도구입니다."
    },
    howItWorks: {
      en: "Regular expressions are patterns compiled into finite automata — specifically, a Non-deterministic Finite Automaton (NFA) in most JavaScript engines. When you type a pattern, the engine compiles it into an internal state machine. The test string is then processed character by character; at each position the engine attempts to match the pattern starting from that index.\n\nThis tool uses JavaScript's built-in `RegExp` object and the `matchAll()` method to find every occurrence. Each match object contains the full match, all captured groups (parenthesized subpatterns), the start index, and the input string. Flags modify behavior: 'g' enables global matching, 'i' makes it case-insensitive, 'm' treats ^ and $ as line boundaries, 's' makes the dot match newlines, 'u' enables Unicode mode, and 'y' enforces sticky matching. The tool highlights all matches in the test string and displays a detailed breakdown of each match group and its position.",
      ko: "정규표현식은 유한 오토마타, 구체적으로는 대부분의 JavaScript 엔진에서 비결정적 유한 오토마타(NFA)로 컴파일되는 패턴입니다. 패턴을 입력하면 엔진이 이를 내부 상태 기계로 컴파일합니다. 테스트 문자열은 문자 단위로 처리되며, 각 위치에서 해당 인덱스부터 시작하는 패턴 매칭을 시도합니다.\n\n이 도구는 JavaScript의 내장 `RegExp` 객체와 `matchAll()` 메서드를 사용하여 모든 일치 항목을 찾습니다. 각 매치 객체에는 전체 매치, 모든 캡처 그룹(괄호로 묶인 하위 패턴), 시작 인덱스, 입력 문자열이 포함됩니다. 플래그는 동작을 변경합니다: 'g'는 전역 매칭, 'i'는 대소문자 무시, 'm'은 ^와 $를 줄 경계로 처리, 's'는 점이 줄바꿈과 매칭, 'u'는 유니코드 모드, 'y'는 고정 매칭을 활성화합니다. 도구는 테스트 문자열에서 모든 매칭을 하이라이트하고 각 매칭 그룹과 위치의 상세 분석을 표시합니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  "uuid-generator": {
    about: {
      en: "UUID Generator creates universally unique identifiers (UUIDs) conforming to RFC 4122 version 4. It can generate single or bulk UUIDs with options for uppercase/lowercase and with or without hyphens. Widely used by developers for database primary keys, distributed system identifiers, session tokens, and correlation IDs.",
      ko: "UUID 생성기는 RFC 4122 버전 4를 준수하는 범용 고유 식별자(UUID)를 생성합니다. 단일 또는 대량 UUID 생성이 가능하며, 대소문자 및 하이픈 포함 여부를 선택할 수 있습니다. 데이터베이스 기본 키, 분산 시스템 식별자, 세션 토큰, 상관 관계 ID에 널리 사용됩니다."
    },
    howItWorks: {
      en: "A UUID (Universally Unique Identifier) is a 128-bit value represented as 32 hexadecimal digits in the format 8-4-4-4-12 (e.g., 550e8400-e29b-41d4-a716-446655440000). Version 4 UUIDs are generated entirely from random or pseudo-random numbers, with two fixed bits: the version field (4 bits set to 0100) and the variant field (2 bits set to 10).\n\nThis tool uses `crypto.getRandomValues()` to fill a 16-byte array with cryptographically secure random values. It then sets the version nibble (bits 48-51) to 0x4 and the variant bits (bits 64-65) to binary 10. The resulting 128 bits are formatted as a hexadecimal string with hyphens. The probability of generating a duplicate is astronomically low — with 122 random bits, you would need to generate approximately 2.71 x 10^18 UUIDs to have a 50% chance of a single collision (the birthday paradox bound).",
      ko: "UUID(범용 고유 식별자)는 128비트 값으로, 8-4-4-4-12 형식의 32자리 16진수로 표현됩니다(예: 550e8400-e29b-41d4-a716-446655440000). 버전 4 UUID는 전적으로 난수로 생성되며, 두 개의 고정 비트가 있습니다: 버전 필드(4비트, 0100으로 설정)와 변형 필드(2비트, 10으로 설정).\n\n이 도구는 `crypto.getRandomValues()`를 사용하여 16바이트 배열을 암호학적으로 안전한 난수로 채웁니다. 그런 다음 버전 니블(비트 48-51)을 0x4로, 변형 비트(비트 64-65)를 이진수 10으로 설정합니다. 결과 128비트는 하이픈이 포함된 16진수 문자열로 포맷됩니다. 중복 생성 확률은 천문학적으로 낮습니다 — 122개의 랜덤 비트로, 단 한 번의 충돌이 발생할 50% 확률에 도달하려면 약 2.71 x 10^18개의 UUID를 생성해야 합니다(생일 역설 한계)."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  "hash-generator": {
    about: {
      en: "Hash Generator computes cryptographic hash digests for any text input using MD5, SHA-1, SHA-256, and SHA-512 algorithms. It displays all hash outputs simultaneously for easy comparison. Essential for developers verifying file integrity, generating checksums, or working with authentication systems that require hashed credentials.",
      ko: "해시 생성기는 MD5, SHA-1, SHA-256, SHA-512 알고리즘을 사용하여 텍스트 입력의 암호화 해시 다이제스트를 계산합니다. 모든 해시 출력을 동시에 표시하여 쉽게 비교할 수 있습니다. 파일 무결성 검증, 체크섬 생성, 해시된 자격 증명이 필요한 인증 시스템을 다루는 개발자에게 필수적인 도구입니다."
    },
    howItWorks: {
      en: "Cryptographic hash functions are one-way mathematical algorithms that map arbitrary-length input to a fixed-length output (the digest). This tool leverages the Web Crypto API's `crypto.subtle.digest()` method, which runs native browser implementations of each algorithm.\n\nMD5 produces a 128-bit (32 hex character) digest using four rounds of 16 operations each on 512-bit blocks. SHA-1 outputs 160 bits (40 hex chars) using 80 rounds on 512-bit blocks. SHA-256 generates a 256-bit (64 hex char) digest using 64 rounds of compression on 512-bit blocks with eight 32-bit working variables. SHA-512 produces a 512-bit (128 hex char) digest using 80 rounds on 1024-bit blocks with eight 64-bit working variables. All hashes exhibit the avalanche effect — changing a single input bit flips roughly half the output bits — making them suitable for integrity verification and digital signatures. Note: MD5 and SHA-1 are considered cryptographically broken for collision resistance and should not be used for security-critical applications.",
      ko: "암호화 해시 함수는 임의 길이의 입력을 고정 길이 출력(다이제스트)으로 매핑하는 단방향 수학 알고리즘입니다. 이 도구는 Web Crypto API의 `crypto.subtle.digest()` 메서드를 활용하여 브라우저의 네이티브 구현을 사용합니다.\n\nMD5는 512비트 블록에 대해 각 16개 연산으로 구성된 4라운드를 수행하여 128비트(32자 16진수) 다이제스트를 생성합니다. SHA-1은 512비트 블록에 대해 80라운드를 수행하여 160비트(40자 16진수)를 출력합니다. SHA-256은 512비트 블록에 8개의 32비트 작업 변수를 사용하여 64라운드 압축을 수행하고 256비트(64자 16진수) 다이제스트를 생성합니다. SHA-512는 1024비트 블록에 8개의 64비트 작업 변수를 사용하여 80라운드를 수행하고 512비트(128자 16진수) 다이제스트를 생성합니다. 모든 해시는 눈사태 효과를 나타내어 입력 비트 하나를 변경하면 출력 비트의 약 절반이 바뀌므로, 무결성 검증과 디지털 서명에 적합합니다. 참고: MD5와 SHA-1은 충돌 저항성이 깨진 것으로 간주되어 보안에 민감한 애플리케이션에는 사용하지 않아야 합니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  "url-encoder-decoder": {
    about: {
      en: "URL Encoder/Decoder converts text to and from percent-encoded format (RFC 3986) for safe use in URLs and query strings. It handles all Unicode characters, reserved characters, and special symbols. Indispensable for web developers dealing with query parameters, API endpoints, or debugging encoded URLs.",
      ko: "URL 인코더/디코더는 텍스트를 퍼센트 인코딩 형식(RFC 3986)으로 변환하거나 원본으로 복원하여 URL과 쿼리 문자열에서 안전하게 사용할 수 있게 합니다. 모든 유니코드 문자, 예약 문자, 특수 기호를 처리합니다. 쿼리 파라미터, API 엔드포인트, 인코딩된 URL 디버깅을 다루는 웹 개발자에게 필수적인 도구입니다."
    },
    howItWorks: {
      en: "URL encoding (percent-encoding) replaces unsafe or reserved characters in a URI with a percent sign (%) followed by two hexadecimal digits representing the character's byte value. For example, a space becomes %20, and the ampersand (&) becomes %26. This is defined in RFC 3986, which specifies that only unreserved characters (A-Z, a-z, 0-9, -, _, ., ~) can appear literally in a URI.\n\nFor multi-byte Unicode characters (such as Korean, Chinese, or emoji), the text is first encoded to UTF-8, and each resulting byte is individually percent-encoded. For instance, the Korean character '한' (U+D55C) encodes to the UTF-8 bytes EC 95 9C, producing %ED%95%9C. This tool uses JavaScript's `encodeURIComponent()` for encoding and `decodeURIComponent()` for decoding. Unlike `encodeURI()`, `encodeURIComponent()` also encodes reserved characters like /, ?, #, and & — making it the correct choice for encoding individual query parameter values.",
      ko: "URL 인코딩(퍼센트 인코딩)은 URI에서 안전하지 않거나 예약된 문자를 퍼센트 기호(%)와 해당 문자의 바이트 값을 나타내는 두 자리 16진수로 대체합니다. 예를 들어 공백은 %20이 되고, 앰퍼샌드(&)는 %26이 됩니다. 이는 RFC 3986에 정의되어 있으며, 비예약 문자(A-Z, a-z, 0-9, -, _, ., ~)만 URI에 그대로 나타날 수 있도록 규정합니다.\n\n다중 바이트 유니코드 문자(한국어, 중국어, 이모지 등)의 경우 텍스트를 먼저 UTF-8로 인코딩한 뒤, 각 바이트를 개별적으로 퍼센트 인코딩합니다. 예를 들어 한글 '한'(U+D55C)은 UTF-8 바이트 ED 95 9C으로 인코딩되어 %ED%95%9C이 됩니다. 이 도구는 인코딩에 JavaScript의 `encodeURIComponent()`, 디코딩에 `decodeURIComponent()`를 사용합니다. `encodeURI()`와 달리 `encodeURIComponent()`는 /, ?, #, & 같은 예약 문자도 인코딩하므로, 개별 쿼리 파라미터 값을 인코딩하는 데 적합한 선택입니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  "markdown-editor": {
    about: {
      en: "Markdown Editor provides a split-pane interface with a text editor on the left and a real-time rendered preview on the right. It supports the full CommonMark specification plus GitHub Flavored Markdown (GFM) extensions — including tables, task lists, strikethrough, and fenced code blocks with syntax highlighting. Perfect for writing README files, documentation, blog posts, and technical notes.",
      ko: "마크다운 에디터는 왼쪽에 텍스트 편집기, 오른쪽에 실시간 렌더링 미리보기를 제공하는 분할 화면 인터페이스입니다. 전체 CommonMark 사양과 GitHub Flavored Markdown(GFM) 확장 — 표, 작업 목록, 취소선, 구문 강조가 포함된 펜스 코드 블록 — 을 지원합니다. README 파일, 문서, 블로그 포스트, 기술 노트 작성에 최적화된 도구입니다."
    },
    howItWorks: {
      en: "Markdown is a lightweight markup language created by John Gruber in 2004, later formalized as CommonMark. The rendering pipeline consists of two stages: parsing and HTML generation. The parser tokenizes the Markdown source into an AST of block-level elements (headings, paragraphs, lists, blockquotes, code blocks) and inline elements (bold, italic, links, images, code spans).\n\nBlock parsing is line-oriented: the parser examines each line to determine if it starts a new block (e.g., # for headings, - for list items, > for blockquotes) or continues an existing one. Inline parsing then processes the text content within each block, handling nested emphasis (** for bold, * for italic), link references, and escape sequences. The resulting AST is walked to produce sanitized HTML output. GFM extensions add table parsing (pipe-delimited columns with alignment markers), task list detection (- [ ] and - [x]), autolinked URLs, and strikethrough (~~ delimiters). The preview updates on every keystroke using a debounced render cycle for smooth performance.",
      ko: "마크다운은 2004년 John Gruber가 만든 경량 마크업 언어로, 이후 CommonMark으로 공식화되었습니다. 렌더링 파이프라인은 파싱과 HTML 생성 두 단계로 구성됩니다. 파서는 마크다운 소스를 블록 수준 요소(제목, 단락, 목록, 인용문, 코드 블록)와 인라인 요소(굵게, 기울임, 링크, 이미지, 코드 스팬)의 AST로 토큰화합니다.\n\n블록 파싱은 줄 단위로 진행됩니다: 파서는 각 줄이 새 블록을 시작하는지(예: # 제목, - 목록 항목, > 인용문) 기존 블록을 계속하는지 판단합니다. 그런 다음 인라인 파싱이 각 블록의 텍스트 내용을 처리하며, 중첩된 강조(** 굵게, * 기울임), 링크 참조, 이스케이프 시퀀스를 처리합니다. 결과 AST를 순회하여 정제된 HTML 출력을 생성합니다. GFM 확장은 테이블 파싱(파이프 구분 열과 정렬 마커), 작업 목록 감지(- [ ] 및 - [x]), 자동 링크 URL, 취소선(~~ 구분자)을 추가합니다. 미리보기는 디바운스된 렌더링 주기를 사용하여 키 입력마다 업데이트되어 부드러운 성능을 제공합니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  "text-diff": {
    about: {
      en: "Text Diff compares two blocks of text and highlights the exact differences between them at the line and character level. It supports side-by-side and unified diff views, making it easy to spot additions, deletions, and modifications. Ideal for code reviewers, writers comparing document revisions, and anyone who needs to identify changes between two versions of text.",
      ko: "텍스트 비교 도구는 두 텍스트 블록을 비교하여 줄 및 문자 수준에서 정확한 차이점을 하이라이트합니다. 나란히 보기와 통합 diff 보기를 지원하여 추가, 삭제, 수정 사항을 쉽게 발견할 수 있습니다. 코드 리뷰어, 문서 수정본을 비교하는 작성자, 두 버전의 텍스트 간 변경 사항을 식별해야 하는 모든 분에게 유용합니다."
    },
    howItWorks: {
      en: "This tool implements the Myers diff algorithm, the same algorithm used by Git. The algorithm finds the shortest edit script (SES) — the minimum number of insertions and deletions needed to transform one text into another. It operates on an edit graph where the x-axis represents the original text and the y-axis represents the modified text. Diagonal moves represent matching characters (no change), horizontal moves represent deletions, and vertical moves represent insertions.\n\nThe algorithm works by exploring edit paths of increasing distance (d = 0, 1, 2, ...) using a greedy approach that extends each path as far as possible along diagonals (matching sequences). This finds the longest common subsequence (LCS) as a byproduct. Once the shortest edit path is found, it is traced back to produce the diff output. For character-level highlighting within changed lines, a second pass runs the diff algorithm on the individual characters of each modified line pair, enabling precise intra-line change visualization.",
      ko: "이 도구는 Git에서 사용하는 것과 동일한 Myers diff 알고리즘을 구현합니다. 이 알고리즘은 한 텍스트를 다른 텍스트로 변환하는 데 필요한 최소 삽입 및 삭제 횟수인 최단 편집 스크립트(SES)를 찾습니다. x축이 원본 텍스트, y축이 수정된 텍스트를 나타내는 편집 그래프에서 작동합니다. 대각선 이동은 일치하는 문자(변경 없음), 수평 이동은 삭제, 수직 이동은 삽입을 나타냅니다.\n\n알고리즘은 증가하는 거리(d = 0, 1, 2, ...)의 편집 경로를 탐색하며, 각 경로를 대각선(일치하는 시퀀스)을 따라 최대한 확장하는 탐욕적 접근 방식을 사용합니다. 이 과정에서 최장 공통 부분 수열(LCS)이 부산물로 발견됩니다. 최단 편집 경로를 찾으면 이를 역추적하여 diff 출력을 생성합니다. 변경된 줄 내의 문자 수준 하이라이팅을 위해, 각 수정된 줄 쌍의 개별 문자에 대해 diff 알고리즘을 2차로 실행하여 정밀한 줄 내 변경 시각화를 구현합니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  "css-gradient-generator": {
    about: {
      en: "CSS Gradient Generator creates linear, radial, and conic gradients with a visual editor and real-time preview. You can add multiple color stops, adjust angles and positions, and copy the generated CSS code with one click. Built for web designers, front-end developers, and anyone who wants beautiful gradient backgrounds without writing CSS by hand.",
      ko: "CSS 그라디언트 생성기는 시각적 편집기와 실시간 미리보기를 통해 선형, 원형, 원뿔형 그라디언트를 생성합니다. 여러 색상 정지점을 추가하고, 각도와 위치를 조정하며, 생성된 CSS 코드를 한 번의 클릭으로 복사할 수 있습니다. 직접 CSS를 작성하지 않고도 아름다운 그라디언트 배경을 만들고 싶은 웹 디자이너, 프론트엔드 개발자를 위한 도구입니다."
    },
    howItWorks: {
      en: "CSS gradients are image functions that generate smooth transitions between two or more colors, rendered natively by the browser's 2D rasterizer without any image files. The CSS `linear-gradient()` function interpolates colors along a straight line defined by an angle (e.g., 90deg for left-to-right). The `radial-gradient()` function interpolates colors outward from a center point in an elliptical or circular shape. The `conic-gradient()` function sweeps colors around a center point like a color wheel.\n\nEach color stop specifies a color value and an optional position (as a percentage or length). The browser's rendering engine linearly interpolates between adjacent color stops in the sRGB color space by default. This tool generates the standard CSS syntax and also produces `-webkit-` prefixed versions for legacy browser compatibility. The real-time preview renders the gradient on a `<div>` element, so you see exactly how it will appear on your website. You can also layer multiple gradients using comma-separated values in a single `background` property.",
      ko: "CSS 그라디언트는 두 개 이상의 색상 간 부드러운 전환을 생성하는 이미지 함수로, 이미지 파일 없이 브라우저의 2D 래스터라이저가 네이티브로 렌더링합니다. CSS `linear-gradient()` 함수는 각도로 정의된 직선을 따라 색상을 보간합니다(예: 90deg는 왼쪽에서 오른쪽). `radial-gradient()` 함수는 중심점에서 타원 또는 원형으로 바깥쪽으로 색상을 보간합니다. `conic-gradient()` 함수는 색상 휠처럼 중심점을 중심으로 색상을 회전시킵니다.\n\n각 색상 정지점은 색상 값과 선택적 위치(백분율 또는 길이)를 지정합니다. 브라우저의 렌더링 엔진은 기본적으로 sRGB 색상 공간에서 인접한 색상 정지점 사이를 선형 보간합니다. 이 도구는 표준 CSS 구문을 생성하고 레거시 브라우저 호환성을 위해 `-webkit-` 접두사 버전도 제공합니다. 실시간 미리보기는 `<div>` 요소에 그라디언트를 렌더링하므로 웹사이트에서 실제로 어떻게 보일지 정확히 확인할 수 있습니다. 또한 단일 `background` 속성에서 쉼표로 구분된 값을 사용하여 여러 그라디언트를 겹칠 수 있습니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  // ─────────────────────────────────────────────
  // TEXT TOOLS
  // ─────────────────────────────────────────────

  "word-counter": {
    about: {
      en: "Word Counter analyzes your text in real time, showing character count (with and without spaces), word count, sentence count, paragraph count, and estimated reading time. It also displays character limits for popular social media platforms — Twitter/X (280), Instagram (2,200), YouTube title (100), and more. Essential for writers, marketers, and content creators managing platform-specific character limits.",
      ko: "글자수 세기 도구는 실시간으로 문자 수(공백 포함/미포함), 단어 수, 문장 수, 단락 수, 예상 읽기 시간을 분석합니다. Twitter/X(280자), Instagram(2,200자), YouTube 제목(100자) 등 주요 SNS 플랫폼의 글자수 제한도 함께 표시합니다. 플랫폼별 글자수 제한을 관리하는 작가, 마케터, 콘텐츠 크리에이터에게 필수적인 도구입니다."
    },
    howItWorks: {
      en: "Character counting operates at the Unicode code point level. The tool uses the spread operator (`[...text]`) to correctly split the string into code points rather than UTF-16 code units, ensuring that emoji, CJK characters, and surrogate pairs are each counted as one character. Word counting splits text by whitespace boundaries using a regex (`/\\S+/g`), which handles multiple consecutive spaces, tabs, and newlines.\n\nSentence counting uses a regex that matches sentence-ending punctuation (., !, ?) followed by whitespace or end of string, with special handling for common abbreviations (Mr., Dr., etc.) to avoid false positives. Paragraph counting splits by two or more consecutive newlines. Reading time is estimated at 200 words per minute for English (the average adult reading speed) and 500 characters per minute for Korean and other CJK languages. The SNS character limits are hard-coded to each platform's current specifications and checked against the total character count in real time.",
      ko: "문자 수 계산은 유니코드 코드 포인트 수준에서 작동합니다. 도구는 스프레드 연산자(`[...text]`)를 사용하여 UTF-16 코드 유닛이 아닌 코드 포인트 단위로 문자열을 올바르게 분할하여, 이모지, CJK 문자, 서로게이트 쌍을 각각 하나의 문자로 정확히 세냅니다. 단어 수 계산은 정규식(`/\\S+/g`)을 사용하여 공백 경계로 텍스트를 분할하며, 연속 공백, 탭, 줄바꿈을 올바르게 처리합니다.\n\n문장 수 계산은 문장 종료 부호(., !, ?)와 그 뒤의 공백 또는 문자열 끝을 매칭하는 정규식을 사용하며, 일반적인 약어(Mr., Dr. 등)에 대한 특수 처리로 오탐을 방지합니다. 단락 수 계산은 두 개 이상의 연속 줄바꿈으로 분할합니다. 읽기 시간은 영어의 경우 분당 200단어(성인 평균 읽기 속도), 한국어 및 기타 CJK 언어의 경우 분당 500자를 기준으로 추정합니다. SNS 글자수 제한은 각 플랫폼의 현재 사양이 하드코딩되어 있으며, 전체 문자 수와 실시간으로 비교됩니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  "case-converter": {
    about: {
      en: "Case Converter transforms text between multiple casing formats: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE. It processes your entire text instantly with one click and supports copy-to-clipboard for each result. A time-saver for developers renaming variables and writers reformatting headings.",
      ko: "대소문자 변환기는 텍스트를 다양한 형식으로 변환합니다: 대문자(UPPERCASE), 소문자(lowercase), 제목 형식(Title Case), 문장 형식(Sentence case), 카멜 케이스(camelCase), 파스칼 케이스(PascalCase), 스네이크 케이스(snake_case), 케밥 케이스(kebab-case), 상수 형식(CONSTANT_CASE). 한 번의 클릭으로 전체 텍스트를 즉시 변환하며 각 결과에 대한 클립보드 복사를 지원합니다. 변수 이름을 변경하는 개발자와 제목 형식을 정리하는 작가에게 유용합니다."
    },
    howItWorks: {
      en: "Case conversion involves two phases: tokenization and reconstruction. First, the input text is split into individual words by detecting word boundaries — these include spaces, hyphens, underscores, and camelCase transitions (lowercase-to-uppercase). A regex like `/[A-Z]?[a-z]+|[A-Z]+(?=[A-Z][a-z]|\\d|\\b)|[A-Z]|\\d+/g` captures each word token, including abbreviations and numbers.\n\nOnce tokenized, each casing format applies its own reconstruction rules: UPPERCASE calls `toUpperCase()` on every token and joins with the original separator. camelCase lowercases the first token and capitalizes the first letter of subsequent tokens, joining without separators. snake_case lowercases all tokens and joins with underscores. Title Case capitalizes the first letter of each word, with optional handling for articles and prepositions (a, an, the, of, in) to follow English title capitalization rules. Sentence case capitalizes only the first word and proper nouns. The converter preserves non-alphabetic characters (numbers, punctuation) in their original positions.",
      ko: "대소문자 변환은 토큰화와 재구성 두 단계로 이루어집니다. 먼저 입력 텍스트를 단어 경계를 감지하여 개별 단어로 분할합니다 — 경계에는 공백, 하이픈, 밑줄, 카멜 케이스 전환(소문자→대문자)이 포함됩니다. `/[A-Z]?[a-z]+|[A-Z]+(?=[A-Z][a-z]|\\d|\\b)|[A-Z]|\\d+/g` 같은 정규식이 약어와 숫자를 포함한 각 단어 토큰을 캡처합니다.\n\n토큰화가 완료되면 각 케이스 형식이 고유한 재구성 규칙을 적용합니다: UPPERCASE는 모든 토큰에 `toUpperCase()`를 호출하고 원래 구분자로 연결합니다. camelCase는 첫 번째 토큰을 소문자로, 이후 토큰의 첫 글자를 대문자로 변환하고 구분자 없이 연결합니다. snake_case는 모든 토큰을 소문자로 변환하고 밑줄로 연결합니다. Title Case는 각 단어의 첫 글자를 대문자로 변환하며, 영어 제목 대문자 규칙에 따라 관사와 전치사(a, an, the, of, in)를 선택적으로 처리합니다. Sentence case는 첫 번째 단어와 고유 명사만 대문자로 변환합니다. 변환기는 숫자, 구두점 등 알파벳이 아닌 문자를 원래 위치에 그대로 보존합니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  "lorem-ipsum-generator": {
    about: {
      en: "Lorem Ipsum Generator creates placeholder text in configurable amounts — by word count, sentence count, or paragraph count. It generates classic pseudo-Latin Lorem Ipsum text based on Cicero's \"De Finibus Bonorum et Malorum\" as well as randomized variations. Perfect for designers mocking up layouts, developers testing UI components, and print professionals filling page templates.",
      ko: "Lorem Ipsum 생성기는 단어 수, 문장 수 또는 단락 수로 설정 가능한 양의 플레이스홀더 텍스트를 생성합니다. 키케로의 \"De Finibus Bonorum et Malorum\"을 기반으로 한 고전적인 의사 라틴어 텍스트와 무작위 변형을 생성합니다. 레이아웃 목업을 만드는 디자이너, UI 컴포넌트를 테스트하는 개발자, 페이지 템플릿을 채우는 인쇄 전문가에게 유용합니다."
    },
    howItWorks: {
      en: "Lorem Ipsum text originates from sections 1.10.32 and 1.10.33 of Cicero's philosophical work \"De Finibus Bonorum et Malorum\" (45 BC), with words altered, added, and removed to make it nonsensical. This tool stores a curated word bank of approximately 200 Latin-like words extracted from the classical Lorem Ipsum corpus.\n\nThe generation algorithm works differently depending on the selected unit. For word-based generation, it draws words sequentially from the bank with a random offset, wrapping around to the beginning when exhausted. For sentence generation, it assembles 8 to 15 words per sentence (randomized), capitalizes the first word, and appends a period. For paragraph generation, it creates 3 to 7 sentences per paragraph. The first paragraph always begins with \"Lorem ipsum dolor sit amet, consectetur adipiscing elit\" to follow the universally recognized convention. Subsequent content introduces randomization to avoid exact repetition, using a Fisher-Yates shuffle on the word bank at each paragraph boundary.",
      ko: "Lorem Ipsum 텍스트는 키케로의 철학 저작 \"De Finibus Bonorum et Malorum\"(기원전 45년)의 1.10.32절과 1.10.33절에서 유래하며, 단어가 변경, 추가, 제거되어 무의미한 텍스트가 되었습니다. 이 도구는 고전 Lorem Ipsum 코퍼스에서 추출한 약 200개의 라틴어풍 단어 뱅크를 저장합니다.\n\n생성 알고리즘은 선택한 단위에 따라 다르게 작동합니다. 단어 기반 생성은 임의의 오프셋으로 단어 뱅크에서 순차적으로 단어를 가져오며, 소진되면 처음으로 순환합니다. 문장 생성은 문장당 8~15개 단어(무작위)를 조합하고, 첫 단어를 대문자로 변환한 뒤 마침표를 추가합니다. 단락 생성은 단락당 3~7개 문장을 생성합니다. 첫 번째 단락은 보편적으로 인정되는 관례에 따라 항상 \"Lorem ipsum dolor sit amet, consectetur adipiscing elit\"으로 시작합니다. 이후 콘텐츠는 정확한 반복을 피하기 위해 각 단락 경계에서 단어 뱅크에 Fisher-Yates 셔플을 적용하여 무작위성을 도입합니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  },

  "symbol-copy-paste": {
    about: {
      en: "Symbol Copy & Paste provides a comprehensive, searchable collection of special characters, Unicode symbols, and emoji organized by category — arrows, math operators, currency signs, accented letters, dingbats, emoji, and more. Click any symbol to instantly copy it to your clipboard. Invaluable for writers, designers, social media managers, and anyone who needs special characters without memorizing alt codes or Unicode values.",
      ko: "특수문자 & 이모지 복사 도구는 화살표, 수학 연산자, 통화 기호, 악센트 문자, 딩뱃, 이모지 등 카테고리별로 정리된 포괄적이고 검색 가능한 특수 문자 및 유니코드 기호 모음을 제공합니다. 아무 기호나 클릭하면 즉시 클립보드에 복사됩니다. Alt 코드나 유니코드 값을 외울 필요 없이 특수 문자가 필요한 작가, 디자이너, 소셜 미디어 매니저에게 매우 유용한 도구입니다."
    },
    howItWorks: {
      en: "Unicode is the universal character encoding standard that assigns a unique code point (U+0000 to U+10FFFF) to every character in every writing system. This tool curates symbols from several Unicode blocks: Basic Latin (U+0020-007F), Latin-1 Supplement (U+0080-00FF), General Punctuation (U+2000-206F), Mathematical Operators (U+2200-22FF), Arrows (U+2190-21FF), Currency Symbols (U+20A0-20CF), Dingbats (U+2700-27BF), and Emoticons/Emoji (U+1F600-1F64F and beyond).\n\nWhen you click a symbol, the tool uses the Clipboard API (`navigator.clipboard.writeText()`) to copy the character to your system clipboard. The search function performs a fuzzy match against each symbol's Unicode name, category, and common aliases — so searching \"arrow right\" will find \u2192, \u21D2, \u27A1, and related variants. Symbols are rendered using your system's installed fonts; if a font doesn't contain a particular glyph, the browser falls back to system emoji fonts or displays a placeholder. The tool categorizes over 2,000 commonly used symbols for quick browsing without needing to know any code points.",
      ko: "유니코드는 모든 문자 체계의 모든 문자에 고유한 코드 포인트(U+0000 ~ U+10FFFF)를 할당하는 범용 문자 인코딩 표준입니다. 이 도구는 여러 유니코드 블록에서 기호를 선별합니다: Basic Latin(U+0020-007F), Latin-1 Supplement(U+0080-00FF), General Punctuation(U+2000-206F), Mathematical Operators(U+2200-22FF), Arrows(U+2190-21FF), Currency Symbols(U+20A0-20CF), Dingbats(U+2700-27BF), Emoticons/Emoji(U+1F600-1F64F 이상).\n\n기호를 클릭하면 도구가 Clipboard API(`navigator.clipboard.writeText()`)를 사용하여 해당 문자를 시스템 클립보드에 복사합니다. 검색 기능은 각 기호의 유니코드 이름, 카테고리, 일반적인 별칭에 대해 퍼지 매칭을 수행합니다 — 따라서 \"arrow right\"를 검색하면 \u2192, \u21D2, \u27A1 및 관련 변형을 찾을 수 있습니다. 기호는 시스템에 설치된 글꼴을 사용하여 렌더링되며, 글꼴에 특정 글리프가 없으면 브라우저가 시스템 이모지 글꼴로 대체하거나 플레이스홀더를 표시합니다. 이 도구는 코드 포인트를 알 필요 없이 빠르게 탐색할 수 있도록 2,000개 이상의 자주 사용되는 기호를 카테고리별로 분류합니다."
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식"
    }
  }
};
