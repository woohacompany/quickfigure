// 도구별 검색 태그/동의어 - 구어체 검색을 위한 데이터
// slug → { ko: string[], en: string[] }

export const toolTags: Record<string, { ko: string[]; en: string[] }> = {
  // ── Finance ──
  "salary-calculator": {
    ko: ["연봉", "실수령", "월급", "세후", "4대보험", "소득세", "연봉계산", "월급계산", "세금 떼면", "실제로 받는 돈"],
    en: ["salary", "take-home pay", "after tax", "net salary", "paycheck", "how much do I get", "gross to net"],
  },
  "severance-calculator": {
    ko: ["퇴직금", "퇴사", "퇴직", "근속", "입사일", "퇴사일", "퇴직금 얼마"],
    en: ["severance", "retirement pay", "leaving company", "resignation", "termination pay"],
  },
  "loan-calculator": {
    ko: ["대출", "이자", "월 납부", "상환", "원리금", "대출이자", "대출 갚을 때"],
    en: ["loan", "interest", "monthly payment", "repayment", "amortization", "EMI"],
  },
  "dsr-calculator": {
    ko: ["DSR", "대출한도", "총부채", "부채비율", "대출 얼마나", "대출 가능", "스트레스DSR"],
    en: ["DSR", "debt service ratio", "loan limit", "how much can I borrow", "debt ratio"],
  },
  "inheritance-tax-calculator": {
    ko: ["상속", "상속세", "유산", "부모님 재산", "상속 세금"],
    en: ["inheritance", "inheritance tax", "estate tax", "estate planning"],
  },
  "capital-gains-tax-calculator": {
    ko: ["양도세", "집 팔때", "부동산 세금", "아파트 팔면", "양도소득세"],
    en: ["capital gains", "property tax", "selling house", "real estate tax"],
  },
  "acquisition-tax-calculator": {
    ko: ["취득세", "집 살때", "부동산 구매", "아파트 사면"],
    en: ["acquisition tax", "property purchase tax", "buying house", "real estate purchase"],
  },
  "income-tax-calculator": {
    ko: ["종소세", "종합소득", "프리랜서 세금", "사업자 세금", "5월 세금", "종합소득세"],
    en: ["income tax", "comprehensive income", "tax return", "annual tax"],
  },
  "national-pension-calculator": {
    ko: ["국민연금", "연금", "노령연금", "연금 얼마", "연금 수령", "은퇴"],
    en: ["national pension", "pension", "retirement benefit", "how much pension"],
  },
  "accident-settlement-calculator": {
    ko: ["교통사고", "합의금", "위자료", "사고 보상", "접촉사고"],
    en: ["accident settlement", "car accident", "compensation", "insurance claim"],
  },
  "car-tax-calculator": {
    ko: ["자동차 취득세", "차량 등록", "차 살때 세금", "자동차세"],
    en: ["car tax", "vehicle tax", "auto registration", "car purchase tax"],
  },
  "rent-conversion-calculator": {
    ko: ["전세", "월세", "전월세", "보증금", "월세로 바꾸면", "전월세 전환"],
    en: ["rent conversion", "deposit to rent", "jeonse", "monthly rent", "lease conversion"],
  },
  "hourly-wage-calculator": {
    ko: ["시급", "알바", "아르바이트", "시간당", "파트타임"],
    en: ["hourly wage", "hourly rate", "part-time", "per hour", "minimum wage"],
  },
  "weekly-holiday-pay-calculator": {
    ko: ["주휴수당", "주휴", "알바 수당"],
    en: ["weekly holiday pay", "paid weekly holiday", "part-time benefit"],
  },
  "unemployment-calculator": {
    ko: ["실업급여", "실업", "구직급여", "해고", "퇴사 후"],
    en: ["unemployment", "unemployment benefit", "jobseeker allowance", "laid off"],
  },
  "annual-leave-calculator": {
    ko: ["연차", "휴가", "연차발생", "연차 몇개"],
    en: ["annual leave", "vacation days", "paid leave", "PTO", "how many days off"],
  },
  "electricity-calculator": {
    ko: ["전기요금", "전기세", "전기 얼마", "누진세"],
    en: ["electricity bill", "electric cost", "power bill", "utility bill"],
  },
  "discount-calculator": {
    ko: ["할인", "세일", "퍼센트 할인", "얼마 할인"],
    en: ["discount", "sale", "percent off", "how much off", "price after discount"],
  },
  "compound-interest-calculator": {
    ko: ["복리", "이자", "적금", "투자 수익", "복리계산"],
    en: ["compound interest", "investment return", "savings growth", "interest rate"],
  },
  "mortgage-calculator": {
    ko: ["모기지", "주택대출", "집 대출", "주택담보대출"],
    en: ["mortgage", "home loan", "house payment", "housing loan"],
  },
  "retirement-calculator": {
    ko: ["은퇴", "노후", "저축", "은퇴자금", "노후준비"],
    en: ["retirement", "retirement savings", "retire", "nest egg", "401k"],
  },
  "emergency-fund-calculator": {
    ko: ["비상자금", "예비비", "긴급자금"],
    en: ["emergency fund", "rainy day fund", "safety net", "emergency savings"],
  },
  "freelancer-tax-calculator": {
    ko: ["프리랜서", "3.3%", "원천징수", "프리랜서 세금"],
    en: ["freelancer tax", "self-employed tax", "contractor tax", "1099 tax"],
  },
  "vat-calculator": {
    ko: ["부가세", "부가가치세", "VAT", "세금계산서"],
    en: ["VAT", "value added tax", "sales tax", "tax invoice"],
  },
  "loan-comparison-calculator": {
    ko: ["대출 비교", "이자 비교", "대출 어디가 싸"],
    en: ["loan comparison", "compare loans", "best loan rate", "interest comparison"],
  },

  // ── Health ──
  "bmi-calculator": {
    ko: ["BMI", "체질량", "비만", "체중", "다이어트", "몸무게"],
    en: ["BMI", "body mass index", "weight", "obesity", "diet", "overweight"],
  },
  "calorie-calculator": {
    ko: ["칼로리", "다이어트", "하루 칼로리", "권장 칼로리"],
    en: ["calorie", "diet", "daily calorie", "TDEE", "calorie intake", "weight loss"],
  },
  "age-calculator": {
    ko: ["나이", "만나이", "몇살", "생년월일"],
    en: ["age", "how old", "birthday", "date of birth", "age calculator"],
  },
  "sleep-calculator": {
    ko: ["수면", "잠", "몇시간", "기상시간", "취침시간"],
    en: ["sleep", "bedtime", "wake up", "sleep cycle", "how much sleep"],
  },
  "alcohol-calculator": {
    ko: ["음주", "알코올", "술", "혈중알코올", "음주운전", "술 깨는 시간"],
    en: ["alcohol", "BAC", "blood alcohol", "drunk", "sober up", "drinking"],
  },
  "body-fat-calculator": {
    ko: ["체지방", "체지방률", "근육량", "몸매"],
    en: ["body fat", "body fat percentage", "lean mass", "body composition"],
  },

  // ── Image/File ──
  "image-resizer": {
    ko: ["이미지 크기", "사진 크기", "리사이즈", "사이즈 변경", "사진 줄이기"],
    en: ["image resize", "photo size", "resize image", "change dimensions", "scale image"],
  },
  "image-compressor": {
    ko: ["이미지 압축", "사진 용량", "용량 줄이기", "사진 압축"],
    en: ["image compress", "reduce file size", "optimize image", "photo compression"],
  },
  "image-converter": {
    ko: ["이미지 변환", "PNG JPG", "형식 변환", "포맷 변환"],
    en: ["image convert", "PNG to JPG", "format convert", "change format"],
  },
  "image-to-pdf": {
    ko: ["이미지 PDF", "사진 PDF", "JPG PDF"],
    en: ["image to PDF", "photo to PDF", "JPG to PDF", "convert to PDF"],
  },
  "image-upscaler": {
    ko: ["화질", "해상도", "선명하게", "업스케일", "사진 깨짐", "흐릿한 사진"],
    en: ["upscale", "enhance", "resolution", "sharpen", "blurry photo", "improve quality"],
  },
  "image-cropper": {
    ko: ["자르기", "크롭", "사진 잘라", "비율 맞추기", "증명사진"],
    en: ["crop", "trim", "cut image", "aspect ratio", "passport photo"],
  },
  "image-kb-resizer": {
    ko: ["KB", "용량", "200KB", "증명사진 용량", "사진 KB"],
    en: ["KB", "file size", "200KB", "reduce to KB", "passport photo size"],
  },
  "image-watermark": {
    ko: ["워터마크", "로고 넣기", "사진 보호", "저작권"],
    en: ["watermark", "add logo", "protect photo", "copyright"],
  },
  "gif-maker": {
    ko: ["GIF", "움짤", "움짤 만들기", "GIF 만들기", "애니메이션", "짤", "사진 움짤"],
    en: ["GIF", "GIF maker", "animated GIF", "create GIF", "image to GIF", "animation", "make GIF"],
  },
  "pdf-merger": {
    ko: ["PDF", "합치기", "병합", "PDF 하나로", "PDF 묶기"],
    en: ["PDF merge", "combine PDF", "join PDF", "merge files"],
  },
  "pdf-splitter": {
    ko: ["PDF", "분할", "나누기", "페이지 추출"],
    en: ["PDF split", "separate PDF", "extract pages", "divide PDF"],
  },
  "pdf-to-word": {
    ko: ["PDF", "워드", "docx", "PDF에서 워드"],
    en: ["PDF to Word", "PDF to docx", "convert PDF", "editable document"],
  },
  "word-to-pdf": {
    ko: ["워드", "PDF", "docx에서 PDF"],
    en: ["Word to PDF", "docx to PDF", "convert to PDF"],
  },
  "pdf-compressor": {
    ko: ["PDF", "압축", "용량 줄이기", "PDF 크기"],
    en: ["PDF compress", "reduce PDF size", "shrink PDF", "optimize PDF"],
  },
  "pdf-to-jpg": {
    ko: ["PDF", "JPG", "이미지로", "PDF 사진"],
    en: ["PDF to JPG", "PDF to image", "convert PDF to picture"],
  },
  "excel-merge": {
    ko: ["엑셀 합치기", "엑셀 병합", "파일 합치기", "발주서 합치기", "중복 검사"],
    en: ["Excel merge", "combine spreadsheets", "merge files", "Excel combine"],
  },
  "pdf-to-excel": {
    ko: ["PDF 엑셀", "PDF 변환", "PDF 표 추출", "PDF CSV", "PDF 엑셀 변환", "PDF 스프레드시트"],
    en: ["PDF to Excel", "PDF to CSV", "extract table from PDF", "PDF converter", "PDF to spreadsheet", "PDF table extraction"],
  },
  "image-rotate": {
    ko: ["이미지 회전", "사진 회전", "사진 돌리기", "이미지 뒤집기", "사진 반전", "90도 회전"],
    en: ["rotate image", "flip image", "image rotation", "rotate photo", "mirror image", "rotate 90 degrees"],
  },
  "excel-to-pdf": {
    ko: ["엑셀 PDF", "엑셀 변환", "XLSX PDF", "CSV PDF", "엑셀 인쇄", "스프레드시트 PDF"],
    en: ["Excel to PDF", "XLSX to PDF", "CSV to PDF", "convert Excel", "spreadsheet to PDF"],
  },
  "roi-calculator": {
    ko: ["ROI", "투자수익률", "수익률 계산", "투자 계산기", "수익률", "투자 비교", "연환산 수익률"],
    en: ["ROI calculator", "return on investment", "investment return", "ROI", "annualized return", "investment comparison"],
  },
  "currency-converter": {
    ko: ["환율", "환율 계산", "달러 원화", "엔화 환율", "환율 계산기", "달러 환율", "유로 환율", "환전", "오늘 환율", "실시간 환율", "원달러 환율"],
    en: ["currency converter", "exchange rate", "USD to KRW", "currency calculator", "forex", "money converter"],
  },
  "image-to-svg": {
    ko: ["SVG 변환", "이미지 벡터 변환", "JPG SVG", "PNG SVG", "벡터 변환", "벡터화", "일러스트 변환", "로고 벡터", "사진 벡터", "사진 일러스트", "래스터 벡터"],
    en: ["image to SVG", "JPG to SVG", "PNG to SVG", "vectorize image", "raster to vector", "image vectorizer", "convert to vector", "SVG converter", "trace image", "logo to vector"],
  },

  // ── Date & Time ──
  "world-clock": {
    ko: ["세계 시간", "세계 시계", "시차", "시간 변환", "타임존", "뉴욕 시간", "LA 시간", "런던 시간", "한국 미국 시간", "시차 계산", "현재 시간", "세계시간"],
    en: ["world clock", "time zone", "timezone converter", "time difference", "world time", "EST to KST", "PST to KST", "current time", "meeting time", "time zone calculator"],
  },

  // ── Text ──
  "word-counter": {
    ko: ["글자수", "단어수", "자소서", "에세이", "몇글자"],
    en: ["word count", "character count", "essay", "letter count", "how many words"],
  },
  "case-converter": {
    ko: ["대소문자", "대문자", "소문자", "영어 변환"],
    en: ["uppercase", "lowercase", "title case", "text transform", "capitalize"],
  },
  "text-diff": {
    ko: ["텍스트비교", "diff", "차이점", "문서비교", "코드비교"],
    en: ["text compare", "diff", "difference", "compare documents", "code compare"],
  },

  // ── Dev ──
  "json-formatter": {
    ko: ["JSON", "JSON 포맷터", "JSON 정리", "JSON 유효성 검사", "JSON 뷰어", "JSON beautify", "JSON minify", "JSON 변환", "JSON 포맷", "포맷", "정리", "검증"],
    en: ["JSON", "json formatter", "json beautifier", "json validator", "format json", "pretty print json", "json viewer", "json minifier", "json lint", "beautify", "validate"],
  },
  "base64-encoder-decoder": {
    ko: ["Base64", "Base64 인코딩", "Base64 디코딩", "Base64 변환", "Base64 인코더", "Base64 디코더", "이미지 Base64", "텍스트 Base64", "인코딩", "디코딩", "Base64 온라인"],
    en: ["Base64", "base64 encode", "base64 decode", "base64 encoder", "base64 decoder", "base64 converter", "base64 to text", "text to base64", "image to base64", "data URI"],
  },
  "markdown-editor": {
    ko: ["마크다운", "MD", "편집기"],
    en: ["markdown", "MD", "editor", "preview"],
  },

  // ── Generator ──
  "ladder-game": {
    ko: ["사다리", "사다리타기", "사다리게임", "제비뽑기", "랜덤뽑기", "벌칙", "순서정하기", "팀나누기", "당첨", "회식게임"],
    en: ["ladder", "ladder game", "random picker", "team picker", "decision maker", "who pays", "ladder draw", "lottery"],
  },
  "lorem-ipsum-generator": {
    ko: ["더미 텍스트", "로렘입숨", "목업"],
    en: ["dummy text", "lorem ipsum", "placeholder text", "mockup text"],
  },
  "password-generator": {
    ko: ["비밀번호", "패스워드", "랜덤 비번"],
    en: ["password", "random password", "secure password", "password generator"],
  },

  // ── Date ──
  "dday-calculator": {
    ko: ["디데이", "D-day", "기념일", "남은날", "몇일남았나"],
    en: ["D-day", "countdown", "days left", "anniversary", "how many days"],
  },
  "date-calculator": {
    ko: ["날짜", "며칠", "영업일", "기간계산"],
    en: ["date", "business days", "date difference", "duration", "how many days between"],
  },
  "gpa-calculator": {
    ko: ["학점", "GPA", "대학", "성적"],
    en: ["GPA", "grade point", "college", "university", "grades"],
  },
  "timer": {
    ko: ["타이머", "스톱워치", "뽀모도로", "시간측정", "초시계"],
    en: ["timer", "stopwatch", "pomodoro", "countdown", "time tracker"],
  },

  // ── Utility ──
  "symbol-copy-paste": {
    ko: ["특수문자", "기호", "이모지", "특수기호"],
    en: ["symbol", "special character", "emoji", "copy paste"],
  },
  "qr-code-generator": {
    ko: ["QR", "큐알", "QR코드", "바코드"],
    en: ["QR", "QR code", "barcode", "scan code"],
  },
  "color-picker": {
    ko: ["색상", "컬러", "HEX", "RGB", "색깔"],
    en: ["color", "colour", "HEX", "RGB", "color picker"],
  },
  "unit-converter": {
    ko: ["단위", "변환", "cm", "인치", "kg", "파운드"],
    en: ["unit", "convert", "cm", "inch", "kg", "pound", "metric", "imperial"],
  },
  "percentage-calculator": {
    ko: ["퍼센트", "%", "비율", "증감률"],
    en: ["percent", "percentage", "ratio", "increase decrease"],
  },
  "area-converter": {
    ko: ["평수", "제곱미터", "평", "몇평"],
    en: ["area", "square meter", "square feet", "pyeong", "sq ft"],
  },
  "random-number-generator": {
    ko: ["랜덤", "무작위", "로또", "번호 생성"],
    en: ["random", "random number", "lottery", "generate number", "dice"],
  },
  "typing-speed-test": {
    ko: ["타자", "타자 속도", "타자 연습", "타이핑", "타자 테스트", "타자 속도 측정", "키보드 연습", "한타", "영타", "타자 속도 테스트", "타수", "WPM"],
    en: ["typing", "typing speed", "typing test", "WPM", "typing practice", "keyboard speed", "words per minute", "CPM", "typing speed test"],
  },
};
