import type { ToolContentData } from "./tool-content";

export const healthUtilityToolContent: Record<string, ToolContentData> = {
  // ─────────────────────────────────────────────
  // HEALTH TOOLS (6)
  // ─────────────────────────────────────────────

  "bmi-calculator": {
    about: {
      en: "The BMI Calculator computes your Body Mass Index based on your height and weight, helping you understand where you fall on the underweight-to-obese spectrum. It is widely used by individuals, fitness enthusiasts, and healthcare professionals as a quick screening tool for weight-related health risks.",
      ko: "BMI 계산기는 키와 체중을 기반으로 체질량지수를 산출하여 저체중부터 비만까지의 범위에서 본인의 위치를 파악할 수 있도록 도와줍니다. 개인 건강 관리, 피트니스 목표 설정, 의료 현장에서의 기초 선별 도구로 널리 활용됩니다.",
    },
    howItWorks: {
      en: "BMI is calculated using the formula: BMI = weight (kg) ÷ height (m)². For imperial units, the formula is: BMI = [weight (lb) ÷ height (in)²] × 703.\n\nThe result is classified into standard WHO categories: Underweight (< 18.5), Normal weight (18.5–24.9), Overweight (25.0–29.9), and Obese (≥ 30.0). For Asian populations, adjusted thresholds are often used, where overweight begins at 23.0 and obese at 25.0, reflecting differences in body composition and associated health risks.\n\nWhile BMI is a useful population-level indicator, it does not distinguish between muscle mass and fat mass, so athletes with high muscle mass may show elevated BMI values despite having low body fat.",
      ko: "BMI는 다음 공식으로 계산됩니다: BMI = 체중(kg) ÷ 신장(m)². 파운드와 인치를 사용하는 경우: BMI = [체중(lb) ÷ 신장(in)²] × 703 으로 환산합니다.\n\n결과는 세계보건기구(WHO) 기준에 따라 저체중(18.5 미만), 정상(18.5~24.9), 과체중(25.0~29.9), 비만(30.0 이상)으로 분류됩니다. 아시아인의 경우 체형 특성을 반영하여 과체중 기준이 23.0, 비만 기준이 25.0으로 하향 조정된 아시아-태평양 기준이 별도로 적용되기도 합니다.\n\nBMI는 인구 수준의 유용한 지표이지만, 근육량과 지방량을 구분하지 못하므로 근육량이 많은 운동선수의 경우 체지방률이 낮더라도 BMI가 높게 나올 수 있습니다.",
    },
    howItWorksTitle: {
      en: "How It's Calculated",
      ko: "계산 원리",
    },
    disclaimer: {
      en: "This BMI result is for informational purposes only and does not constitute medical advice. BMI does not account for muscle mass, bone density, age, sex, or ethnicity. Please consult a healthcare professional for a comprehensive health assessment.",
      ko: "본 BMI 계산 결과는 참고용이며 의학적 진단을 대체하지 않습니다. BMI는 근육량, 골밀도, 나이, 성별, 인종 등의 요소를 반영하지 못합니다. 정확한 건강 평가를 위해 반드시 의료 전문가와 상담하세요.",
    },
  },

  "calorie-calculator": {
    about: {
      en: "The Calorie Calculator estimates your daily caloric needs based on your age, sex, height, weight, and activity level. Whether you are aiming to lose weight, maintain your current weight, or build muscle, this tool provides a personalized calorie target to guide your nutrition planning.",
      ko: "칼로리 계산기는 나이, 성별, 키, 체중, 활동 수준을 기반으로 하루에 필요한 칼로리 섭취량을 추정합니다. 체중 감량, 현재 체중 유지, 근육 증가 등 목표에 맞는 맞춤형 칼로리 목표치를 제공하여 식단 계획에 도움을 줍니다.",
    },
    howItWorks: {
      en: "This calculator uses two well-established equations to estimate your Basal Metabolic Rate (BMR). The Mifflin-St Jeor equation (recommended): Men: BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161 for women, or + 5 for men. The Harris-Benedict equation: Men: BMR = 88.362 + 13.397 × weight(kg) + 4.799 × height(cm) − 5.677 × age; Women: BMR = 447.593 + 9.247 × weight(kg) + 3.098 × height(cm) − 4.330 × age.\n\nYour BMR is then multiplied by an activity factor to get your Total Daily Energy Expenditure (TDEE): Sedentary (×1.2), Lightly active (×1.375), Moderately active (×1.55), Very active (×1.725), and Extra active (×1.9).\n\nFor weight loss, a deficit of 500 calories/day results in approximately 0.45 kg (1 lb) of weight loss per week. For weight gain, a surplus of 250–500 calories/day is typically recommended for lean muscle building.",
      ko: "이 계산기는 기초대사량(BMR)을 추정하기 위해 두 가지 공인된 공식을 사용합니다. Mifflin-St Jeor 공식(권장): 남성 BMR = 10 × 체중(kg) + 6.25 × 키(cm) − 5 × 나이 + 5, 여성은 마지막에 −161을 적용합니다. Harris-Benedict 공식: 남성 BMR = 88.362 + 13.397 × 체중(kg) + 4.799 × 키(cm) − 5.677 × 나이, 여성 BMR = 447.593 + 9.247 × 체중(kg) + 3.098 × 키(cm) − 4.330 × 나이.\n\n산출된 BMR에 활동 계수를 곱하면 총 일일 에너지 소비량(TDEE)이 됩니다: 비활동적(×1.2), 가벼운 활동(×1.375), 보통 활동(×1.55), 활발한 활동(×1.725), 매우 활발한 활동(×1.9).\n\n체중 감량 시 하루 500kcal 적자를 유지하면 주당 약 0.45kg이 감소하며, 근육 증가를 위해서는 일반적으로 하루 250~500kcal의 잉여 섭취가 권장됩니다.",
    },
    howItWorksTitle: {
      en: "How It's Calculated",
      ko: "계산 원리",
    },
    disclaimer: {
      en: "Calorie estimates are based on general formulas and may not reflect your individual metabolic rate. These results are for reference only and should not replace personalized dietary advice from a registered dietitian or healthcare provider.",
      ko: "칼로리 추정치는 일반적인 공식에 기반하며 개인의 실제 대사율과 차이가 있을 수 있습니다. 본 결과는 참고용이며, 구체적인 식단 계획은 영양사 또는 의료 전문가와 상담하시기 바랍니다.",
    },
  },

  "age-calculator": {
    about: {
      en: "The Age Calculator determines your exact age in years, months, and days from your date of birth. It also displays your Korean age (which counts the birth year as age 1) and calculates the number of days until your next birthday, making it useful for official documents, celebrations, and age verification.",
      ko: "나이 계산기는 생년월일을 기준으로 만 나이를 연, 월, 일 단위로 정확하게 산출합니다. 한국식 나이(세는나이)도 함께 표시하며, 다음 생일까지 남은 일수도 계산해 줍니다. 공식 문서 작성, 각종 기념일 확인, 나이 검증 등 다양한 상황에서 활용할 수 있습니다.",
    },
    howItWorks: {
      en: "The calculator computes the difference between your date of birth and the current date (or a specified reference date). International age counts completed years: the number of full years elapsed since the birth date. If today's month/day is before the birth month/day, the age is reduced by one.\n\nKorean age uses a different system: you are 1 at birth and gain one year every January 1st, regardless of your actual birthday. The formula is: Korean age = current year − birth year + 1. Note that as of June 2023, South Korea officially adopted the international age system for legal and administrative purposes, but Korean age is still widely used in everyday conversation.\n\nThe remaining days to the next birthday are calculated by finding the next occurrence of the birth month/day and computing the day difference from today.",
      ko: "이 계산기는 생년월일과 현재 날짜(또는 지정된 기준일) 사이의 차이를 계산합니다. 만 나이는 생일이 지났는지 여부에 따라 결정됩니다. 오늘의 월/일이 생일 월/일보다 이전이면 만 나이에서 1을 빼줍니다.\n\n한국식 나이(세는나이)는 태어난 해에 1살로 시작하고 매년 1월 1일에 한 살씩 추가되는 방식입니다. 공식: 한국 나이 = 현재 연도 − 출생 연도 + 1. 참고로 2023년 6월부터 대한민국은 법적·행정적으로 만 나이를 공식 채택했지만, 일상 대화에서는 세는나이가 여전히 널리 사용됩니다.\n\n다음 생일까지의 남은 일수는 생일의 다음 발생일을 찾아 오늘과의 일수 차이를 계산하여 산출합니다.",
    },
    howItWorksTitle: {
      en: "How It's Calculated",
      ko: "계산 원리",
    },
    disclaimer: {
      en: "Age calculations are based on calendar dates and may differ from legal age definitions in certain jurisdictions. For official or legal purposes, consult the relevant authority or legal professional.",
      ko: "나이 계산은 달력 날짜 기준이며, 법적 나이 산정 방식은 국가 및 관할권에 따라 다를 수 있습니다. 공식적·법적 목적의 나이 확인은 관련 기관 또는 법률 전문가에게 문의하세요.",
    },
  },

  "sleep-calculator": {
    about: {
      en: "The Sleep Calculator helps you find the optimal bedtime or wake-up time based on 90-minute sleep cycles. By aligning your sleep schedule with natural sleep stages, you can wake up feeling refreshed rather than groggy, improving your overall sleep quality and daytime energy levels.",
      ko: "수면 계산기는 90분 수면 주기를 기반으로 최적의 취침 시간 또는 기상 시간을 찾아줍니다. 자연스러운 수면 단계에 맞춰 수면 스케줄을 조정하면 개운하게 일어날 수 있어 전반적인 수면의 질과 낮 시간의 활력을 높이는 데 도움이 됩니다.",
    },
    howItWorks: {
      en: "Human sleep follows a cyclical pattern of approximately 90 minutes per cycle, progressing through light sleep (N1, N2), deep sleep (N3), and REM sleep. A typical night includes 4 to 6 complete cycles, totaling 6 to 9 hours of sleep.\n\nThe calculator works in two modes. In bedtime mode, given your desired wake-up time, it subtracts multiples of 90 minutes (plus an average 15-minute sleep onset latency) to suggest ideal bedtimes for 4, 5, or 6 full cycles. In wake-up mode, given your bedtime, it adds the 15-minute onset period plus multiples of 90 minutes to suggest optimal wake-up times.\n\nWaking at the end of a complete cycle (during light sleep) rather than in the middle of deep sleep reduces sleep inertia — the groggy, disoriented feeling that occurs when an alarm interrupts a deep sleep phase. The National Sleep Foundation recommends 7–9 hours for adults aged 18–64.",
      ko: "사람의 수면은 약 90분 단위의 주기로 반복되며, 각 주기는 가벼운 수면(N1, N2), 깊은 수면(N3), 렘수면(REM)의 단계를 거칩니다. 일반적으로 하룻밤에 4~6회의 완전한 주기를 거치며, 총 6~9시간의 수면에 해당합니다.\n\n계산기는 두 가지 모드로 작동합니다. 취침 시간 모드에서는 원하는 기상 시간에서 90분의 배수와 평균 입면 시간 15분을 역산하여 4, 5, 6회 주기에 맞는 이상적인 취침 시간을 제안합니다. 기상 시간 모드에서는 취침 시간에 입면 시간 15분과 90분의 배수를 더하여 최적의 기상 시간을 알려줍니다.\n\n수면 주기가 완료되는 시점(가벼운 수면 단계)에 기상하면 깊은 수면 중에 깨어날 때 발생하는 수면 관성(멍한 느낌)을 줄일 수 있습니다. 미국국립수면재단은 18~64세 성인에게 7~9시간의 수면을 권장합니다.",
    },
    howItWorksTitle: {
      en: "How It's Calculated",
      ko: "계산 원리",
    },
    disclaimer: {
      en: "Sleep cycle duration varies between individuals (typically 80–120 minutes). This calculator uses a 90-minute average and a 15-minute sleep onset estimate. If you have persistent sleep difficulties or a suspected sleep disorder, consult a sleep specialist.",
      ko: "수면 주기 길이는 개인에 따라 80~120분으로 다양하며, 본 계산기는 90분 평균과 15분 입면 시간 추정치를 사용합니다. 지속적인 수면 문제나 수면 장애가 의심되는 경우 수면 전문의와 상담하시기 바랍니다.",
    },
  },

  "alcohol-calculator": {
    about: {
      en: "The Alcohol Calculator estimates your Blood Alcohol Concentration (BAC) based on the amount of alcohol consumed, your body weight, sex, and elapsed time since drinking. It helps you understand the approximate effects of alcohol on your body and the estimated time to return to sobriety.",
      ko: "혈중알코올농도 계산기는 음주량, 체중, 성별, 음주 후 경과 시간을 기반으로 추정 혈중알코올농도(BAC)를 산출합니다. 알코올이 신체에 미치는 대략적인 영향과 음주 후 정상 상태로 돌아오는 데 걸리는 예상 시간을 파악하는 데 도움이 됩니다.",
    },
    howItWorks: {
      en: "BAC is estimated using the Widmark formula: BAC = [alcohol consumed (g) ÷ (body weight (g) × Widmark factor r)] × 100 − (elimination rate × hours since drinking).\n\nThe Widmark factor (r) accounts for body water distribution: approximately 0.68 for men and 0.55 for women, reflecting differences in average body composition. Alcohol consumed in grams is derived from the volume of each drink, its alcohol percentage, and the density of ethanol (0.789 g/mL).\n\nThe elimination rate represents how quickly the liver metabolizes alcohol, averaging 0.015 g/100mL per hour (range: 0.010–0.020). This means BAC drops by roughly 0.015% per hour regardless of the amount consumed.\n\nLegal BAC limits vary by country: 0.08% in the US/UK, 0.05% in most of Europe and Australia, and 0.03% in South Korea. Even below legal limits, alcohol impairs reaction time and judgment.",
      ko: "혈중알코올농도(BAC)는 Widmark 공식으로 추정합니다: BAC = [섭취한 알코올(g) ÷ (체중(g) × Widmark 계수 r)] × 100 − (분해 속도 × 음주 후 경과 시간).\n\nWidmark 계수(r)는 체내 수분 분포를 반영하며 남성 약 0.68, 여성 약 0.55입니다. 섭취한 알코올의 그램 수는 음료의 용량, 알코올 도수, 에탄올 밀도(0.789 g/mL)를 곱하여 산출합니다.\n\n분해 속도는 간이 알코올을 대사하는 속도를 나타내며, 평균 시간당 0.015 g/100mL(범위: 0.010~0.020)입니다. 즉, 음주량과 관계없이 BAC는 시간당 약 0.015%씩 감소합니다.\n\n법적 음주 운전 기준은 국가마다 다릅니다: 미국/영국 0.08%, 유럽 대부분과 호주 0.05%, 한국 0.03%. 법적 기준 이하라도 알코올은 반응 속도와 판단력을 저하시킵니다.",
    },
    howItWorksTitle: {
      en: "How It's Calculated",
      ko: "계산 원리",
    },
    disclaimer: {
      en: "BAC estimates are approximate and vary based on individual metabolism, food intake, medications, and other factors. Never use this tool to determine whether you are safe to drive. If you have consumed alcohol, always arrange a safe ride home. This tool does not constitute legal or medical advice.",
      ko: "혈중알코올농도 추정치는 개인의 대사율, 음식 섭취, 복용 약물 등에 따라 달라지는 근사값입니다. 이 도구를 음주 운전 가능 여부 판단에 절대 사용하지 마세요. 음주 후에는 반드시 안전한 귀가 수단을 이용하시기 바랍니다. 본 결과는 법적 또는 의학적 조언이 아닙니다.",
    },
  },

  "body-fat-calculator": {
    about: {
      en: "The Body Fat Calculator estimates your body fat percentage using the U.S. Navy circumference method. By measuring specific body parts with a tape measure, you can get a reasonable estimate of your body composition without expensive equipment like DEXA scans or hydrostatic weighing.",
      ko: "체지방률 계산기는 미 해군(US Navy) 둘레 측정법을 사용하여 체지방률을 추정합니다. 줄자로 특정 신체 부위를 측정하면 DEXA 스캔이나 수중 체중 측정 같은 고가 장비 없이도 체성분을 합리적으로 파악할 수 있습니다.",
    },
    howItWorks: {
      en: "The U.S. Navy method uses circumference measurements and height to estimate body fat percentage. For men: Body Fat % = 86.010 × log₁₀(abdomen − neck) − 70.041 × log₁₀(height) + 36.76. For women: Body Fat % = 163.205 × log₁₀(waist + hip − neck) − 97.684 × log₁₀(height) − 78.387.\n\nAll measurements should be in centimeters (or inches, then converted). Abdomen/waist is measured at the navel level, the neck at its narrowest point just below the larynx, and hips (women only) at the widest point.\n\nThe American Council on Exercise (ACE) body fat categories are: Essential fat (Men 2–5%, Women 10–13%), Athletes (Men 6–13%, Women 14–20%), Fitness (Men 14–17%, Women 21–24%), Average (Men 18–24%, Women 25–31%), Obese (Men 25%+, Women 32%+). This method has a typical accuracy of ±3–4% compared to DEXA scans.",
      ko: "미 해군 방법은 둘레 측정값과 키를 사용하여 체지방률을 추정합니다. 남성: 체지방률 = 86.010 × log₁₀(복부 − 목) − 70.041 × log₁₀(키) + 36.76. 여성: 체지방률 = 163.205 × log₁₀(허리 + 엉덩이 − 목) − 97.684 × log₁₀(키) − 78.387.\n\n모든 측정은 센티미터(또는 인치 후 변환) 단위로 합니다. 복부/허리는 배꼽 높이에서, 목은 후두 바로 아래 가장 가는 부분에서, 엉덩이(여성만)는 가장 넓은 부분에서 측정합니다.\n\n미국운동협회(ACE) 체지방 분류 기준: 필수 지방(남성 2~5%, 여성 10~13%), 선수(남성 6~13%, 여성 14~20%), 피트니스(남성 14~17%, 여성 21~24%), 보통(남성 18~24%, 여성 25~31%), 비만(남성 25% 이상, 여성 32% 이상). 이 방법의 일반적인 정확도는 DEXA 스캔 대비 ±3~4%입니다.",
    },
    howItWorksTitle: {
      en: "How It's Calculated",
      ko: "계산 원리",
    },
    disclaimer: {
      en: "Body fat estimates from circumference measurements are approximations with a typical error margin of ±3–4%. Results may be less accurate for very lean or very overweight individuals. For precise body composition analysis, consult a healthcare professional or use clinical-grade equipment.",
      ko: "둘레 측정을 통한 체지방률 추정은 ±3~4%의 오차 범위를 가진 근사값입니다. 매우 마르거나 과체중인 경우 정확도가 떨어질 수 있습니다. 정밀한 체성분 분석을 위해서는 의료 전문가와 상담하거나 임상용 장비를 이용하세요.",
    },
  },

  // ─────────────────────────────────────────────
  // UTILITY TOOLS (14)
  // ─────────────────────────────────────────────

  "qr-code-generator": {
    about: {
      en: "The QR Code Generator instantly creates scannable QR codes from URLs, text, Wi-Fi credentials, contact information, and more. You can customize the size and download the generated code as a PNG image, making it perfect for marketing materials, business cards, event tickets, and product packaging.",
      ko: "QR 코드 생성기는 URL, 텍스트, Wi-Fi 정보, 연락처 등으로부터 스캔 가능한 QR 코드를 즉시 만들어줍니다. 크기를 조절하고 PNG 이미지로 다운로드할 수 있어 마케팅 자료, 명함, 행사 티켓, 제품 패키지 등에 활용하기 좋습니다.",
    },
    howItWorks: {
      en: "QR (Quick Response) codes encode data into a two-dimensional matrix of black and white modules. The encoding process first converts your input text into a binary data stream, then applies Reed-Solomon error correction to ensure the code remains readable even if up to 30% of it is damaged or obscured.\n\nThe data is arranged in a specific pattern that includes finder patterns (the three large squares in corners) for orientation detection, timing patterns for module grid alignment, and format/version information. The remaining modules store the actual encoded data.\n\nThis generator supports multiple data types: plain text, URLs (with automatic URI scheme detection), Wi-Fi network configuration (SSID, password, encryption type), and vCard contact data. Error correction level M (15% recovery) is used by default, balancing data capacity with reliability. All processing is done in your browser — no data is sent to any server.",
      ko: "QR(Quick Response) 코드는 데이터를 흑백 모듈의 2차원 행렬로 인코딩합니다. 인코딩 과정에서 입력 텍스트를 이진 데이터 스트림으로 변환한 후, Reed-Solomon 오류 정정을 적용하여 코드의 최대 30%가 손상되거나 가려져도 판독이 가능하도록 합니다.\n\n데이터는 방향 감지를 위한 파인더 패턴(모서리의 큰 정사각형 3개), 모듈 격자 정렬을 위한 타이밍 패턴, 포맷/버전 정보를 포함하는 특정 패턴으로 배열되며, 나머지 모듈에 실제 인코딩된 데이터가 저장됩니다.\n\n이 생성기는 일반 텍스트, URL(자동 URI 스킴 감지), Wi-Fi 네트워크 설정(SSID, 비밀번호, 암호화 유형), vCard 연락처 데이터 등 다양한 데이터 유형을 지원합니다. 기본적으로 오류 정정 레벨 M(15% 복구)이 사용되며, 모든 처리는 브라우저에서 이루어져 서버로 데이터가 전송되지 않습니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "color-picker": {
    about: {
      en: "The Color Picker lets you select any color visually or enter a value in HEX, RGB, or HSL format and instantly convert between all three. It is an essential tool for web designers, UI/UX professionals, and anyone who needs precise color values for CSS, graphic design, or branding work.",
      ko: "색상 선택기는 시각적으로 색상을 선택하거나 HEX, RGB, HSL 값을 입력하여 세 가지 형식 간 즉시 변환할 수 있는 도구입니다. CSS 작성, 그래픽 디자인, 브랜딩 작업 등에서 정확한 색상 값이 필요한 웹 디자이너, UI/UX 전문가에게 필수적인 도구입니다.",
    },
    howItWorks: {
      en: "Colors can be represented in multiple mathematical models. HEX is a hexadecimal notation (#RRGGBB) where each pair represents Red, Green, and Blue intensity from 00 to FF (0–255 in decimal). RGB (Red, Green, Blue) uses decimal values from 0 to 255 for each channel, defining colors as combinations of light intensities.\n\nHSL (Hue, Saturation, Lightness) represents color in a more intuitive way: Hue is the color angle on a 360° color wheel (0°=Red, 120°=Green, 240°=Blue), Saturation is the color intensity from 0% (gray) to 100% (vivid), and Lightness ranges from 0% (black) to 100% (white) with 50% being the pure color.\n\nConversion between these formats involves mathematical transformations. HEX to RGB is a direct base-16 to base-10 conversion. RGB to HSL requires computing the chroma (difference between max and min channel values), then deriving hue from the dominant channel, saturation from chroma relative to lightness, and lightness as the average of max and min values.",
      ko: "색상은 여러 수학적 모델로 표현할 수 있습니다. HEX는 16진수 표기법(#RRGGBB)으로 각 쌍이 빨강, 초록, 파랑의 강도를 00~FF(10진수 0~255)로 나타냅니다. RGB(Red, Green, Blue)는 각 채널에 0~255의 10진수 값을 사용하여 빛의 강도 조합으로 색상을 정의합니다.\n\nHSL(Hue, Saturation, Lightness)은 보다 직관적인 방식으로 색상을 표현합니다: 색조(Hue)는 360° 색상환에서의 각도(0°=빨강, 120°=초록, 240°=파랑), 채도(Saturation)는 0%(회색)~100%(선명) 범위의 색상 강도, 밝기(Lightness)는 0%(검정)~100%(흰색)이며 50%가 순색입니다.\n\n형식 간 변환은 수학적 변환을 통해 이루어집니다. HEX→RGB는 16진법에서 10진법으로의 직접 변환이며, RGB→HSL은 채널 최대/최소 값의 차이인 채도를 계산한 후 지배적 채널에서 색조를, 채도와 밝기의 관계에서 채도를, 최대/최소 값의 평균에서 밝기를 도출합니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "unit-converter": {
    about: {
      en: "The Unit Converter handles conversions across length, weight, temperature, volume, area, speed, and more. Simply select the category, choose your source and target units, and get instant results. It is ideal for students, engineers, travelers, and anyone working with different measurement systems.",
      ko: "단위 변환기는 길이, 무게, 온도, 부피, 면적, 속도 등 다양한 단위 간 변환을 지원합니다. 카테고리를 선택하고 원본 및 대상 단위를 고르면 즉시 결과를 확인할 수 있어 학생, 엔지니어, 여행자 등 다양한 측정 체계를 다루는 모든 분들에게 유용합니다.",
    },
    howItWorks: {
      en: "Unit conversion uses mathematical ratios between measurement standards. Linear conversions (length, weight, volume) multiply the input by a conversion factor relative to a base unit. For example, 1 mile = 1.60934 km, 1 pound = 0.453592 kg, and 1 gallon (US) = 3.78541 liters.\n\nTemperature conversions use unique formulas because temperature scales have different zero points: °F = °C × 9/5 + 32, K = °C + 273.15, and °F = (K − 273.15) × 9/5 + 32.\n\nThe converter maintains a lookup table of precise conversion factors sourced from NIST (National Institute of Standards and Technology) and the International Bureau of Weights and Measures (BIPM). All calculations use IEEE 754 double-precision floating-point arithmetic, and results are rounded to an appropriate number of significant figures to avoid misleading precision.",
      ko: "단위 변환은 측정 표준 간의 수학적 비율을 사용합니다. 선형 변환(길이, 무게, 부피)은 기본 단위 대비 변환 계수를 곱합니다. 예: 1마일 = 1.60934km, 1파운드 = 0.453592kg, 1갤런(미국) = 3.78541리터.\n\n온도 변환은 온도 척도마다 영점이 다르기 때문에 고유한 공식을 사용합니다: °F = °C × 9/5 + 32, K = °C + 273.15, °F = (K − 273.15) × 9/5 + 32.\n\n변환기는 NIST(미국 국립표준기술연구소)와 BIPM(국제도량형국)에서 제공하는 정밀한 변환 계수 조회 테이블을 유지합니다. 모든 계산은 IEEE 754 배정밀도 부동소수점 연산을 사용하며, 오해의 소지가 있는 정밀도를 피하기 위해 적절한 유효 숫자로 반올림됩니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "percentage-calculator": {
    about: {
      en: "The Percentage Calculator solves all common percentage problems: finding what percent one number is of another, calculating a percentage of a value, and determining percentage increase or decrease. It is a quick, everyday tool for shopping discounts, tip calculations, grade conversions, and financial analysis.",
      ko: "퍼센트 계산기는 한 숫자가 다른 숫자의 몇 퍼센트인지, 특정 값의 백분율 계산, 증감률 계산 등 모든 일반적인 퍼센트 문제를 해결합니다. 할인 계산, 팁 계산, 성적 환산, 재무 분석 등 일상에서 빠르게 활용할 수 있는 도구입니다.",
    },
    howItWorks: {
      en: "The calculator handles three fundamental percentage operations. First, \"What is X% of Y?\": Result = Y × (X / 100). For example, 15% of 200 = 200 × 0.15 = 30.\n\nSecond, \"X is what % of Y?\": Percentage = (X / Y) × 100. For example, 30 is what % of 200? → (30 / 200) × 100 = 15%.\n\nThird, \"Percentage change from X to Y\": Change = [(Y − X) / |X|] × 100. A positive result indicates an increase, while a negative result indicates a decrease. For example, from 80 to 100: [(100 − 80) / 80] × 100 = 25% increase.\n\nAdditional calculations include reverse percentage (finding the original value before a percentage was applied) and compound percentage changes. All operations use standard floating-point arithmetic with results displayed to two decimal places by default.",
      ko: "이 계산기는 세 가지 기본 퍼센트 연산을 처리합니다. 첫째, \"Y의 X%는?\": 결과 = Y × (X / 100). 예: 200의 15% = 200 × 0.15 = 30.\n\n둘째, \"X는 Y의 몇 %?\": 백분율 = (X / Y) × 100. 예: 30은 200의 몇 %? → (30 / 200) × 100 = 15%.\n\n셋째, \"X에서 Y로의 증감률\": 변화율 = [(Y − X) / |X|] × 100. 양수는 증가, 음수는 감소를 의미합니다. 예: 80에서 100으로: [(100 − 80) / 80] × 100 = 25% 증가.\n\n역퍼센트(백분율이 적용되기 전의 원래 값 구하기)와 복합 퍼센트 변화 계산도 지원합니다. 모든 연산은 표준 부동소수점 연산을 사용하며 결과는 기본적으로 소수점 둘째 자리까지 표시됩니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "area-converter": {
    about: {
      en: "The Area Converter specializes in converting between Korean pyeong (평) and square meters (㎡), along with other common area units like square feet, acres, and hectares. It is particularly useful for Korean real estate transactions, interior design planning, and comparing property sizes across different measurement systems.",
      ko: "평수 변환기는 한국에서 널리 쓰이는 평(坪)과 제곱미터(㎡) 간의 변환을 전문으로 하며, 평방피트, 에이커, 헥타르 등 기타 면적 단위도 함께 지원합니다. 부동산 거래, 인테리어 설계, 다양한 측정 체계 간 면적 비교 시 특히 유용합니다.",
    },
    howItWorks: {
      en: "The core conversion factor is: 1 pyeong (평) = 3.3058 m² (square meters). This derives from the traditional Japanese tsubo measurement, where 1 tsubo = 6 shaku × 6 shaku, and 1 shaku ≈ 0.3030 m, so 1 tsubo = (6 × 0.3030)² ≈ 3.3058 m².\n\nFor other area conversions: 1 m² = 10.7639 ft², 1 acre = 4,046.86 m², 1 hectare = 10,000 m², and 1 km² = 1,000,000 m². To convert between any two units, the calculator first converts the input to square meters (the base unit), then converts from square meters to the target unit.\n\nNote: Although South Korea officially adopted the metric system and the use of pyeong in commercial real estate listings was banned in 2007, pyeong remains the most commonly understood unit in everyday Korean real estate conversations. A typical Korean apartment size of \"30평\" equals approximately 99.17 m² (often marketed as \"84㎡ exclusive area\" in official listings).",
      ko: "핵심 변환 계수: 1평 = 3.3058㎡. 이는 일본의 쓰보(坪) 측정에서 유래하며, 1쓰보 = 6자(尺) × 6자, 1자 ≈ 0.3030m이므로 1쓰보 = (6 × 0.3030)² ≈ 3.3058㎡입니다.\n\n기타 면적 변환: 1㎡ = 10.7639ft², 1에이커 = 4,046.86㎡, 1헥타르 = 10,000㎡, 1km² = 1,000,000㎡. 임의의 두 단위 간 변환 시 입력값을 먼저 제곱미터(기본 단위)로 변환한 후, 제곱미터에서 대상 단위로 변환합니다.\n\n참고: 한국은 공식적으로 미터법을 채택했고 2007년부터 상업용 부동산 매물에 평 사용이 금지되었지만, 일상적인 부동산 대화에서는 여전히 평이 가장 널리 통용됩니다. 흔히 말하는 \"30평\" 아파트는 약 99.17㎡이며, 공식 매물 정보에서는 \"전용면적 84㎡\"로 표기되는 경우가 많습니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "date-calculator": {
    about: {
      en: "The Date Calculator computes the difference between two dates in years, months, and days, and can add or subtract a specified number of days from any date. It also supports business day calculations that exclude weekends and public holidays, making it ideal for project planning, contract management, and deadline tracking.",
      ko: "날짜 계산기는 두 날짜 사이의 차이를 연, 월, 일 단위로 계산하고, 특정 날짜에 일수를 더하거나 빼는 기능을 제공합니다. 주말과 공휴일을 제외한 영업일 계산도 지원하여 프로젝트 계획, 계약 관리, 마감일 추적 등에 유용합니다.",
    },
    howItWorks: {
      en: "Date difference calculation breaks down the interval between two dates into years, months, and remaining days using the Gregorian calendar. The algorithm accounts for varying month lengths (28–31 days) and leap years (divisible by 4, except centuries not divisible by 400).\n\nFor date addition/subtraction, the calculator adds or subtracts the specified number of calendar days to the start date. Leap year handling ensures February 29 is correctly processed: a year is a leap year if divisible by 4, unless divisible by 100, unless also divisible by 400.\n\nBusiness day calculations iterate through each day in the range, counting only Monday through Friday while skipping weekends. When holidays are included, the calculator checks each date against a holiday list for the selected country/region. The result shows both the total calendar days and the net business days between two dates.",
      ko: "날짜 차이 계산은 그레고리력을 기반으로 두 날짜 사이의 간격을 연, 월, 나머지 일수로 분해합니다. 알고리즘은 월별 일수 차이(28~31일)와 윤년(4로 나누어지되 100으로 나누어지는 세기는 제외, 단 400으로 나누어지면 윤년)을 반영합니다.\n\n날짜 더하기/빼기는 시작일에 지정된 달력 일수를 가감합니다. 윤년 처리에 따라 2월 29일이 올바르게 계산됩니다.\n\n영업일 계산은 범위 내의 각 날짜를 순회하며 월~금요일만 카운트하고 주말을 건너뜁니다. 공휴일 포함 시 선택한 국가/지역의 공휴일 목록과 대조하여 확인합니다. 결과에는 총 달력 일수와 순 영업일수가 모두 표시됩니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "dday-calculator": {
    about: {
      en: "The D-Day Calculator counts down (or up) the exact number of days between today and your target date. Whether it is a wedding, exam, anniversary, project deadline, or any important milestone, this tool provides a clear countdown with additional breakdowns in weeks, hours, and minutes.",
      ko: "디데이 계산기는 오늘부터 목표 날짜까지 남은(또는 경과한) 정확한 일수를 세어줍니다. 결혼식, 시험, 기념일, 프로젝트 마감일 등 중요한 날까지의 카운트다운을 주, 시간, 분 단위로 상세하게 보여줍니다.",
    },
    howItWorks: {
      en: "The D-Day calculation finds the absolute difference in days between the current date and the target date. Internally, both dates are converted to their Unix timestamp (milliseconds since January 1, 1970 00:00:00 UTC), and the difference is computed: days = Math.floor(|target − today| / 86,400,000).\n\nIf the target date is in the future, it displays as \"D−N\" (N days remaining). If the target date is in the past, it displays as \"D+N\" (N days elapsed). The tool also calculates and displays equivalent units: weeks (days ÷ 7), total hours (days × 24), and total minutes (days × 1,440).\n\nTimezone handling uses the user's local timezone by default, with midnight (00:00:00) as the reference time for both dates to ensure consistent day counting regardless of the time the calculator is accessed.",
      ko: "디데이 계산은 현재 날짜와 목표 날짜 사이의 절대 일수 차이를 구합니다. 내부적으로 두 날짜를 Unix 타임스탬프(1970년 1월 1일 UTC 기준 밀리초)로 변환한 후 차이를 계산합니다: 일수 = Math.floor(|목표일 − 오늘| / 86,400,000).\n\n목표일이 미래이면 \"D−N\"(N일 남음), 과거이면 \"D+N\"(N일 경과)으로 표시됩니다. 주(일수 ÷ 7), 총 시간(일수 × 24), 총 분(일수 × 1,440) 등 환산 단위도 함께 보여줍니다.\n\n시간대 처리는 기본적으로 사용자의 로컬 시간대를 사용하며, 두 날짜 모두 자정(00:00:00)을 기준으로 하여 계산기에 접속하는 시각에 관계없이 일관된 일수 계산을 보장합니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "gpa-calculator": {
    about: {
      en: "The GPA Calculator computes your Grade Point Average across 4.5, 4.3, and 4.0 grading scales commonly used in Korean and international universities. Enter your courses, credit hours, and grades to instantly calculate your semester or cumulative GPA, helping with academic planning, scholarship applications, and graduate school admissions.",
      ko: "학점 계산기는 한국 및 해외 대학에서 주로 사용하는 4.5, 4.3, 4.0 학점 체계별 평균 평점(GPA)을 계산합니다. 과목명, 학점 수, 성적을 입력하면 학기 또는 누적 GPA를 즉시 산출하여 학업 계획, 장학금 신청, 대학원 입시 준비에 활용할 수 있습니다.",
    },
    howItWorks: {
      en: "GPA is calculated as a weighted average: GPA = Σ(grade points × credit hours) ÷ Σ(credit hours). Each letter grade maps to a numeric value that depends on the grading scale.\n\nOn a 4.5 scale (common in Korean universities): A+ = 4.5, A0 = 4.0, B+ = 3.5, B0 = 3.0, C+ = 2.5, C0 = 2.0, D+ = 1.5, D0 = 1.0, F = 0.0. On a 4.3 scale: A+ = 4.3, A0 = 4.0, A− = 3.7, B+ = 3.3, B0 = 3.0, B− = 2.7, and so on. On a 4.0 scale (US standard): A = 4.0, A− = 3.7, B+ = 3.3, B0 = 3.0, etc.\n\nPass/Fail (P/F) courses are excluded from GPA calculation — they contribute to earned credits but do not affect the grade point average. The calculator supports both semester GPA (single term) and cumulative GPA (all terms combined) modes.",
      ko: "GPA는 가중 평균으로 계산됩니다: GPA = Σ(성적 점수 × 학점 수) ÷ Σ(학점 수). 각 문자 성적은 학점 체계에 따라 다른 숫자 값에 대응합니다.\n\n4.5 만점(한국 대학 일반): A+ = 4.5, A0 = 4.0, B+ = 3.5, B0 = 3.0, C+ = 2.5, C0 = 2.0, D+ = 1.5, D0 = 1.0, F = 0.0. 4.3 만점: A+ = 4.3, A0 = 4.0, A− = 3.7, B+ = 3.3, B0 = 3.0, B− = 2.7 등. 4.0 만점(미국 표준): A = 4.0, A− = 3.7, B+ = 3.3, B0 = 3.0 등.\n\nPass/Fail(P/F) 과목은 GPA 계산에서 제외되며, 취득 학점에는 포함되지만 평균 평점에는 영향을 미치지 않습니다. 학기 GPA(단일 학기)와 누적 GPA(전체 학기 합산) 모드를 모두 지원합니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "timer": {
    about: {
      en: "The Timer & Stopwatch provides a countdown timer, a stopwatch with lap tracking, and a built-in Pomodoro timer (25-minute work / 5-minute break cycles). It runs entirely in your browser with audio alerts, making it perfect for productivity, cooking, workouts, and time management without installing any app.",
      ko: "타이머 & 스톱워치는 카운트다운 타이머, 랩 기록이 가능한 스톱워치, 뽀모도로 타이머(25분 작업 / 5분 휴식 사이클)를 제공합니다. 브라우저에서 완전히 작동하며 알림 소리를 지원해 생산성 관리, 요리, 운동, 시간 관리에 앱 설치 없이 바로 활용할 수 있습니다.",
    },
    howItWorks: {
      en: "The timer uses the browser's high-resolution performance API (performance.now()) combined with requestAnimationFrame for smooth, accurate time display. Rather than relying on setInterval (which can drift over time due to JavaScript's single-threaded event loop), the elapsed time is calculated as the difference between the current timestamp and the recorded start time.\n\nThe countdown timer subtracts elapsed time from the set duration and triggers an audio notification (using the Web Audio API) when it reaches zero. The stopwatch accumulates elapsed time from the start event, with lap functionality recording intermediate timestamps.\n\nThe Pomodoro mode implements the Pomodoro Technique: 25-minute focused work sessions followed by 5-minute short breaks, with a 15–30 minute long break after every 4 completed pomodoros. Visual and audio cues signal transitions between work and break phases. Timer state persists across page visibility changes using the Page Visibility API to ensure accuracy even when the tab is in the background.",
      ko: "타이머는 브라우저의 고해상도 performance API(performance.now())와 requestAnimationFrame을 결합하여 부드럽고 정확한 시간 표시를 구현합니다. JavaScript 단일 스레드 이벤트 루프로 인한 오차가 발생할 수 있는 setInterval 대신, 현재 타임스탬프와 기록된 시작 시간의 차이로 경과 시간을 계산합니다.\n\n카운트다운 타이머는 설정 시간에서 경과 시간을 빼고, 0에 도달하면 Web Audio API를 사용한 알림음을 재생합니다. 스톱워치는 시작 이벤트부터 경과 시간을 누적하며, 랩 기능으로 중간 타임스탬프를 기록합니다.\n\n뽀모도로 모드는 뽀모도로 기법을 구현합니다: 25분 집중 작업 후 5분 짧은 휴식, 4회 완료 후 15~30분 긴 휴식. 작업-휴식 전환 시 시각적·청각적 알림을 제공합니다. Page Visibility API를 활용하여 탭이 백그라운드에 있어도 정확한 시간이 유지됩니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "world-clock": {
    about: {
      en: "The World Clock displays the current time in multiple cities and time zones simultaneously, with easy conversion between any two zones. It is invaluable for remote teams coordinating across time zones, international travelers planning calls, and businesses managing global operations.",
      ko: "세계시계는 여러 도시와 시간대의 현재 시각을 동시에 표시하며, 임의의 두 시간대 간 간편한 변환 기능을 제공합니다. 시간대를 넘나들며 협업하는 원격 팀, 국제 통화를 계획하는 여행자, 글로벌 업무를 관리하는 기업에 필수적인 도구입니다.",
    },
    howItWorks: {
      en: "The World Clock leverages the JavaScript Intl.DateTimeFormat API and the IANA Time Zone Database (also known as the tz database or Olson database). Each timezone is identified by a region/city string (e.g., \"America/New_York\", \"Asia/Seoul\") and has defined rules for UTC offset and Daylight Saving Time (DST) transitions.\n\nTime conversion between zones is performed by first converting the source time to UTC (Coordinated Universal Time), then applying the target zone's offset. For example, converting 3:00 PM KST (UTC+9) to EST (UTC−5 or UTC−4 during DST): 15:00 − 9 hours = 06:00 UTC, then 06:00 − 5 hours = 01:00 AM EST.\n\nThe clock updates every second using requestAnimationFrame to stay synchronized with the system clock. DST transitions are handled automatically by the browser's Intl API, which references the operating system's timezone data. This ensures accurate time display even during spring-forward and fall-back transitions.",
      ko: "세계시계는 JavaScript의 Intl.DateTimeFormat API와 IANA 시간대 데이터베이스(tz 데이터베이스 또는 Olson 데이터베이스)를 활용합니다. 각 시간대는 지역/도시 문자열(예: \"America/New_York\", \"Asia/Seoul\")로 식별되며, UTC 오프셋과 일광절약시간(DST) 전환 규칙이 정의되어 있습니다.\n\n시간대 간 변환은 먼저 원본 시간을 UTC(협정 세계시)로 변환한 후 대상 시간대의 오프셋을 적용합니다. 예: 오후 3시 KST(UTC+9)를 EST(UTC−5, DST 시 UTC−4)로 변환 → 15:00 − 9시간 = 06:00 UTC → 06:00 − 5시간 = 오전 1:00 EST.\n\n시계는 requestAnimationFrame을 사용하여 매초 업데이트되며 시스템 시계와 동기화됩니다. DST 전환은 운영 체제의 시간대 데이터를 참조하는 브라우저 Intl API에 의해 자동으로 처리되어 서머타임 전환 시에도 정확한 시간이 표시됩니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "ladder-game": {
    about: {
      en: "The Ladder Game (Sadari-tagi) is a classic Korean random selection game where participants are assigned to outcomes through a ladder-shaped grid with hidden horizontal bridges. It is commonly used for fair decision-making: assigning tasks, choosing who pays for a meal, determining presentation order, and settling friendly disputes.",
      ko: "사다리타기는 참가자들이 숨겨진 가로 다리가 있는 사다리 형태의 격자를 따라 결과에 배정되는 한국의 대표적인 랜덤 선택 게임입니다. 업무 배분, 식사비 결정, 발표 순서 정하기, 친선 분쟁 해결 등 공정한 의사결정에 널리 사용됩니다.",
    },
    howItWorks: {
      en: "The ladder game constructs a vertical grid with N columns (one per participant) and a configurable number of horizontal rungs (bridges) placed randomly between adjacent columns. The bridges are generated using a pseudo-random algorithm (Math.random() or the Crypto API for better randomness) that ensures no two bridges overlap at the same row between the same pair of columns.\n\nWhen a participant starts at the top of their column and traces downward, they must follow any horizontal bridge they encounter, moving to the adjacent column before continuing down. This creates a permutation — a one-to-one mapping from starting positions to ending results.\n\nMathematically, any permutation of N elements can be decomposed into adjacent transpositions, which is exactly what the ladder bridges represent. The randomness of the outcome depends on the number and placement of bridges. With sufficient bridges (typically 1.5× to 2× the number of columns), the resulting permutation approaches a uniform random distribution, making the game fair for all participants.",
      ko: "사다리타기는 N개의 세로줄(참가자당 하나)과 인접한 줄 사이에 무작위로 배치되는 가로 다리(가로줄)로 구성된 격자를 생성합니다. 다리는 의사 난수 알고리즘(Math.random() 또는 더 나은 무작위성을 위한 Crypto API)을 사용하여 생성되며, 같은 행의 같은 열 쌍 사이에 두 다리가 겹치지 않도록 보장합니다.\n\n참가자가 열의 맨 위에서 시작하여 아래로 내려갈 때, 가로 다리를 만나면 반드시 인접 열로 이동한 후 계속 내려갑니다. 이는 시작 위치에서 결과로의 일대일 대응인 순열(permutation)을 만들어냅니다.\n\n수학적으로 N개 원소의 모든 순열은 인접 호환(adjacent transposition)으로 분해할 수 있으며, 이것이 바로 사다리의 가로 다리가 나타내는 것입니다. 결과의 무작위성은 다리의 수와 배치에 따라 달라지며, 충분한 수의 다리(일반적으로 열 수의 1.5~2배)가 있으면 결과 순열이 균등 랜덤 분포에 근접하여 모든 참가자에게 공정한 게임이 됩니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "schedule-finder": {
    about: {
      en: "The Schedule Finder helps groups find the best meeting time through a simple voting-based system. The organizer proposes candidate time slots, participants mark their availability, and the tool identifies the times that work for the most people. No sign-up required — just share the link and collect votes.",
      ko: "일정 조율기는 투표 기반 시스템으로 그룹의 최적 미팅 시간을 찾아줍니다. 주최자가 후보 시간대를 제안하면 참가자들이 가능한 시간을 표시하고, 도구가 가장 많은 사람이 참석 가능한 시간대를 식별합니다. 회원 가입 없이 링크를 공유하여 바로 투표를 수집할 수 있습니다.",
    },
    howItWorks: {
      en: "The Schedule Finder operates in three phases. In the creation phase, the organizer selects a date range and defines available time blocks (e.g., 9 AM–12 PM, 2 PM–5 PM across Monday to Friday). The tool generates a unique shareable URL containing the schedule configuration encoded in the URL parameters or a short unique ID.\n\nIn the voting phase, each participant opens the shared link and marks their availability for each time slot using a three-state system: Available (green), Maybe (yellow), or Unavailable (red/unmarked). Participant responses are aggregated in real-time.\n\nIn the results phase, the tool ranks all time slots by total availability score, highlighting the optimal meeting times. The scoring algorithm weights \"Available\" as 1 point and \"Maybe\" as 0.5 points. Ties are broken by preferring earlier dates and times. A visual heat map shows the group's collective availability at a glance, making it easy to identify consensus.",
      ko: "일정 조율기는 세 단계로 작동합니다. 생성 단계에서 주최자가 날짜 범위와 가용 시간 블록(예: 월~금 오전 9시~12시, 오후 2시~5시)을 설정합니다. 도구는 URL 파라미터에 일정 설정을 인코딩하거나 짧은 고유 ID를 포함한 공유 가능한 고유 URL을 생성합니다.\n\n투표 단계에서 각 참가자가 공유 링크를 열고 각 시간대에 대한 가능 여부를 세 가지 상태로 표시합니다: 가능(녹색), 아마도(노란색), 불가능(빨간색/미표시). 참가자 응답은 실시간으로 집계됩니다.\n\n결과 단계에서 모든 시간대를 총 가용 점수로 순위를 매겨 최적의 미팅 시간을 강조 표시합니다. 점수 알고리즘은 \"가능\"에 1점, \"아마도\"에 0.5점을 부여합니다. 동점 시 이른 날짜와 시간이 우선됩니다. 시각적 히트맵으로 그룹 전체의 가용 현황을 한눈에 파악할 수 있어 합의점을 쉽게 찾을 수 있습니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "random-number-generator": {
    about: {
      en: "The Random Number Generator produces random integers or decimals within a specified range. It supports single number generation, multiple numbers at once, and options for allowing or excluding duplicates. It is commonly used for lotteries, raffles, statistical sampling, gaming, and educational purposes.",
      ko: "난수 생성기는 지정된 범위 내에서 랜덤 정수 또는 소수를 생성합니다. 단일 숫자 생성, 여러 숫자 동시 생성, 중복 허용/제외 옵션을 지원합니다. 추첨, 통계 표본 추출, 게임, 교육 등 다양한 용도로 활용됩니다.",
    },
    howItWorks: {
      en: "This generator uses the Web Crypto API (crypto.getRandomValues()) to produce cryptographically secure pseudo-random numbers, which are far more unpredictable than Math.random(). The Crypto API draws entropy from the operating system's random number source (e.g., /dev/urandom on Linux, CryptGenRandom on Windows).\n\nTo generate a random integer in the range [min, max], the algorithm creates a random 32-bit unsigned integer, then maps it to the desired range using modular arithmetic with rejection sampling to avoid modulo bias: a random value is discarded and regenerated if it falls in the biased remainder range.\n\nFor generating multiple unique numbers (no duplicates), the Fisher-Yates shuffle algorithm is used when the range is small relative to the count, or a Set-based rejection method when the range is large. This ensures uniform distribution — each possible outcome has an equal probability of being selected.",
      ko: "이 생성기는 Web Crypto API(crypto.getRandomValues())를 사용하여 암호학적으로 안전한 의사 난수를 생성하며, Math.random()보다 훨씬 예측 불가능합니다. Crypto API는 운영 체제의 난수 소스(Linux의 /dev/urandom, Windows의 CryptGenRandom 등)에서 엔트로피를 가져옵니다.\n\n[min, max] 범위의 랜덤 정수를 생성하기 위해 32비트 부호 없는 정수를 만든 후, 모듈로 편향(modulo bias)을 방지하는 거부 샘플링(rejection sampling)과 함께 모듈러 연산으로 원하는 범위에 매핑합니다.\n\n중복 없는 여러 숫자 생성 시, 범위가 생성 개수에 비해 작으면 Fisher-Yates 셔플 알고리즘을, 범위가 크면 Set 기반 거부 방식을 사용합니다. 이를 통해 균등 분포가 보장되어 각 가능한 결과가 동일한 확률로 선택됩니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },

  "typing-speed-test": {
    about: {
      en: "The Typing Speed Test measures your typing speed in Words Per Minute (WPM) and accuracy percentage using curated English and Korean text passages. Track your progress over time, identify problem keys, and improve your typing skills with practice sessions of varying difficulty levels.",
      ko: "타이핑 속도 테스트는 엄선된 영문 및 한글 텍스트 구절을 사용하여 분당 타자 수(WPM)와 정확도를 측정합니다. 시간에 따른 실력 변화를 추적하고, 취약한 키를 파악하며, 다양한 난이도의 연습 세션으로 타이핑 실력을 향상할 수 있습니다.",
    },
    howItWorks: {
      en: "Typing speed is measured in Words Per Minute (WPM), where a \"word\" is standardized as 5 characters (including spaces). The formula is: WPM = (total characters typed / 5) / time in minutes. Gross WPM counts all keystrokes, while Net WPM subtracts errors: Net WPM = Gross WPM − (uncorrected errors / time in minutes).\n\nAccuracy is calculated as: Accuracy % = (correct characters / total characters typed) × 100. The test tracks each keystroke in real-time, comparing it against the reference text character by character. Errors are highlighted immediately, allowing self-correction (backspace) which counts as a corrected error.\n\nFor Korean text, typing speed is measured in Characters Per Minute (CPM) or Strokes Per Minute, as Korean syllable blocks (e.g., 한) are composed of 2–3 individual keystrokes (ㅎ+ㅏ+ㄴ). The test detects whether the input method is English or Korean and adjusts the metric accordingly. A character-level diff algorithm identifies which specific keys cause the most errors, displayed in a post-test analysis.",
      ko: "타이핑 속도는 분당 단어 수(WPM)로 측정되며, \"단어\"는 공백 포함 5자로 표준화됩니다. 공식: WPM = (총 입력 문자 수 / 5) / 시간(분). 총 WPM은 모든 키 입력을 카운트하고, 순 WPM은 오류를 차감합니다: 순 WPM = 총 WPM − (미수정 오류 수 / 시간(분)).\n\n정확도: 정확도(%) = (정확한 문자 수 / 총 입력 문자 수) × 100. 테스트는 각 키 입력을 실시간으로 추적하며 기준 텍스트와 문자별로 비교합니다. 오류는 즉시 강조 표시되며, 백스페이스로 자체 수정할 수 있고 이는 수정된 오류로 카운트됩니다.\n\n한글 텍스트의 경우 타자 속도는 분당 타수(CPM) 또는 분당 키 입력 수로 측정됩니다. 한글 음절 블록(예: 한)은 2~3개의 개별 키 입력(ㅎ+ㅏ+ㄴ)으로 구성되기 때문입니다. 테스트는 입력 방식이 영문인지 한글인지 감지하여 측정 지표를 자동 조정합니다. 문자 수준 diff 알고리즘으로 가장 많은 오류를 유발하는 특정 키를 식별하여 테스트 후 분석에 표시합니다.",
    },
    howItWorksTitle: {
      en: "How It Works",
      ko: "작동 방식",
    },
  },
};
