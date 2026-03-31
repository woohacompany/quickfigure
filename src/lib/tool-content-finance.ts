import type { ToolContentData } from "./tool-content";

export const financeToolContent: Record<string, ToolContentData> = {
  "salary-calculator": {
    about: {
      en: "The Salary Calculator estimates your actual take-home pay after deducting Korea's four major social insurances (National Pension, Health Insurance, Long-term Care Insurance, Employment Insurance) and income tax withholdings. It is designed for Korean salaried employees who want to understand the gap between their gross annual salary and net monthly income.",
      ko: "연봉 실수령액 계산기는 4대 보험(국민연금, 건강보험, 장기요양보험, 고용보험)과 소득세·지방소득세 공제 후 실제 손에 쥐는 월급을 산출합니다. 연봉 협상 전 실수령액을 미리 파악하거나, 이직 시 급여를 비교하려는 직장인에게 유용한 도구입니다."
    },
    howItWorks: {
      en: "Your gross annual salary is divided by 12 to get the monthly gross pay. From this, the following deductions are applied:\n\n• National Pension: 4.5% of monthly gross (capped at a maximum standard income)\n• Health Insurance: 3.545% of monthly gross\n• Long-term Care Insurance: 12.81% of the Health Insurance amount\n• Employment Insurance: 0.9% of monthly gross\n• Income Tax: calculated using Korea's progressive tax brackets (6%–45%) with the simplified withholding table\n• Local Income Tax: 10% of income tax\n\nNet take-home pay = Monthly Gross − (4 insurances + Income Tax + Local Income Tax). The calculator also shows total annual deductions and your effective tax rate.",
      ko: "연봉을 12로 나누어 월 급여를 산출한 뒤, 다음 항목을 순차적으로 공제합니다.\n\n• 국민연금: 월 급여의 4.5% (기준소득월액 상한선 적용)\n• 건강보험: 월 급여의 3.545%\n• 장기요양보험: 건강보험료의 12.81%\n• 고용보험: 월 급여의 0.9%\n• 소득세: 간이세액표 기준 누진세율(6%~45%) 적용\n• 지방소득세: 소득세의 10%\n\n실수령액 = 월 급여 − (4대 보험 + 소득세 + 지방소득세). 부양가족 수에 따라 소득세 공제액이 달라지므로 가족 수를 입력하면 보다 정확한 결과를 얻을 수 있습니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "This calculator provides estimates based on standard Korean social insurance rates and simplified tax withholding tables. Actual deductions may vary depending on your specific employment contract, additional allowances, and individual tax circumstances. Please consult a tax professional or your company's HR department for exact figures.",
      ko: "본 계산기는 표준 4대 보험료율과 간이세액표를 기준으로 한 추정치입니다. 실제 공제액은 비과세 수당, 부양가족 공제, 회사별 급여 체계에 따라 달라질 수 있습니다. 정확한 금액은 회사 인사팀이나 세무사에게 문의하세요."
    }
  },

  "freelancer-tax-calculator": {
    about: {
      en: "The Freelancer Tax Calculator helps Korean freelancers and independent contractors estimate their net income after the 3.3% withholding tax (3% income tax + 0.3% local income tax). It also projects your comprehensive income tax liability at year-end so you can plan ahead for tax season.",
      ko: "프리랜서 세금 계산기는 3.3% 원천징수(소득세 3% + 지방소득세 0.3%) 후 실수령액을 계산하고, 종합소득세 신고 시 예상 납부세액 또는 환급액을 미리 파악할 수 있는 도구입니다. 프리랜서, 1인 사업자, 외주 작업자에게 필수적인 세금 계획 도구입니다."
    },
    howItWorks: {
      en: "The withholding amount is calculated as: Gross Payment × 3.3% (3% income tax + 0.3% local income tax). Net payment = Gross − Withholding.\n\nFor annual tax projection, the calculator estimates your comprehensive income tax using:\n1. Total annual freelance income\n2. Minus necessary expenses (standard deduction rates by industry: 60%–80%, or actual expenses)\n3. Minus personal deductions (basic deduction of ₩1.5M per person)\n4. Apply progressive tax rates (6%–45%)\n5. Subtract already-withheld amounts to estimate your refund or additional tax due.",
      ko: "원천징수액 = 계약금액 × 3.3% (소득세 3% + 지방소득세 0.3%). 실수령액 = 계약금액 − 원천징수액.\n\n종합소득세 예상 계산은 다음 단계로 진행됩니다:\n1. 연간 총 프리랜서 수입 합산\n2. 필요경비 공제 (업종별 단순경비율 60%~80% 또는 실제 경비)\n3. 인적공제 (본인 기본공제 150만 원 등)\n4. 과세표준에 누진세율(6%~45%) 적용\n5. 이미 원천징수된 금액을 차감하여 추가 납부세액 또는 환급액 산출."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "This calculator uses standard expense deduction rates and simplified tax brackets. Your actual tax liability depends on total income sources, applicable deductions, and tax credits. Consult a certified tax accountant for accurate tax filing.",
      ko: "본 계산기는 단순경비율과 기본 세율을 기준으로 한 추정치입니다. 실제 세액은 다른 소득 합산, 세액공제, 실제 경비 증빙에 따라 달라집니다. 정확한 신고는 세무사에게 의뢰하시기 바랍니다."
    }
  },

  "compound-interest-calculator": {
    about: {
      en: "The Compound Interest Calculator shows how your money grows over time through the power of compounding. Enter your initial investment, monthly contributions, interest rate, and time period to visualize your wealth accumulation. Ideal for anyone planning long-term savings, retirement funds, or investment portfolios.",
      ko: "복리 계산기는 원금과 이자가 함께 불어나는 복리의 마법을 수치로 보여주는 도구입니다. 초기 투자금, 매월 추가 적립액, 예상 수익률, 투자 기간을 입력하면 최종 금액과 이자 수익을 확인할 수 있습니다. 적금, 펀드, ETF 투자 계획을 세울 때 활용하세요."
    },
    howItWorks: {
      en: "The compound interest formula is: A = P(1 + r/n)^(nt), where P = principal, r = annual interest rate, n = compounding frequency per year, t = time in years.\n\nFor regular monthly contributions (PMT), the future value of an annuity formula is added: FV = PMT × [((1 + r/n)^(nt) − 1) / (r/n)]\n\nTotal Amount = Compound growth of principal + Future value of contributions. Total Interest Earned = Total Amount − Principal − Total Contributions. The calculator supports monthly, quarterly, semi-annual, and annual compounding frequencies.",
      ko: "복리 공식: A = P(1 + r/n)^(nt). 여기서 P = 원금, r = 연이율, n = 연간 복리 횟수, t = 투자 기간(년).\n\n매월 적립금이 있는 경우, 연금의 미래가치 공식이 추가됩니다: FV = PMT × [((1 + r/n)^(nt) − 1) / (r/n)]\n\n최종 금액 = 원금의 복리 성장분 + 적립금의 미래가치. 총 이자 수익 = 최종 금액 − 원금 − 총 적립금. 월복리, 분기복리, 반기복리, 연복리 중 선택하여 계산할 수 있습니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "This calculator assumes a fixed interest rate throughout the entire period. Actual investment returns fluctuate and are not guaranteed. Past performance does not indicate future results. Consider consulting a financial advisor before making investment decisions.",
      ko: "본 계산기는 투자 기간 동안 고정 수익률을 가정합니다. 실제 투자 수익률은 시장 상황에 따라 변동되며 원금 손실이 발생할 수 있습니다. 투자 결정 전 금융 전문가와 상담하시기 바랍니다."
    }
  },

  "mortgage-calculator": {
    about: {
      en: "The Mortgage Calculator estimates your monthly mortgage payment, total interest paid, and amortization schedule for a home loan. Input the property price, down payment, loan term, and interest rate to plan your home purchase budget. Essential for first-time homebuyers and anyone refinancing their existing mortgage.",
      ko: "주택담보대출 계산기는 주택 가격, 대출 금액, 금리, 대출 기간을 입력하면 월 상환액과 총 이자 부담을 계산합니다. 원리금균등상환 방식의 상세 상환 스케줄도 확인할 수 있어, 내 집 마련 자금 계획이나 대환대출 검토 시 필수적인 도구입니다."
    },
    howItWorks: {
      en: "Monthly payment is calculated using the standard amortization formula: M = P × [r(1+r)^n] / [(1+r)^n − 1], where P = loan principal, r = monthly interest rate (annual rate / 12), n = total number of monthly payments.\n\nThe amortization schedule breaks down each payment into principal and interest portions. Early payments are mostly interest; as the loan matures, the principal portion increases. Total Interest = (Monthly Payment × n) − P. The calculator also shows your loan-to-value (LTV) ratio based on the down payment percentage.",
      ko: "월 상환액 공식 (원리금균등상환): M = P × [r(1+r)^n] / [(1+r)^n − 1]. 여기서 P = 대출 원금, r = 월 이자율(연이율 ÷ 12), n = 총 상환 개월 수.\n\n상환 스케줄에서 매월 납입액은 이자 부분과 원금 부분으로 나뉩니다. 초기에는 이자 비중이 높고, 시간이 지날수록 원금 상환 비중이 커집니다. 총 이자 = (월 납입액 × n) − 대출 원금. LTV(담보인정비율)도 함께 확인할 수 있습니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "This calculator provides estimates for reference only. Actual mortgage terms, rates, and fees vary by lender and your creditworthiness. It does not include property taxes, insurance, or other closing costs. Consult your bank or mortgage broker for official loan quotes.",
      ko: "본 계산기는 참고용 추정치이며, 실제 대출 조건은 금융기관, 신용등급, 담보 가치에 따라 다릅니다. 취득세, 보험료, 중개수수료 등 부대비용은 포함되지 않습니다. 정확한 대출 조건은 은행이나 대출 상담사에게 문의하세요."
    }
  },

  "retirement-calculator": {
    about: {
      en: "The Retirement Calculator helps you estimate how much you need to save to retire comfortably. By entering your current age, target retirement age, desired monthly income, and expected investment returns, you can see whether your savings plan is on track or needs adjustment.",
      ko: "은퇴 저축 계산기는 현재 나이, 목표 은퇴 나이, 희망 월 생활비, 예상 투자 수익률을 입력하면 은퇴 시점까지 필요한 총 자금과 매월 저축해야 할 금액을 알려줍니다. 노후 준비를 체계적으로 계획하려는 모든 분에게 유용합니다."
    },
    howItWorks: {
      en: "The calculator works in two phases:\n\n1. Accumulation Phase (now → retirement): Calculates how your current savings and monthly contributions grow using compound interest: FV = PV(1+r)^n + PMT × [((1+r)^n − 1) / r]\n\n2. Distribution Phase (retirement → end): Determines how long your nest egg lasts given monthly withdrawals, adjusted for inflation: Required Fund = Monthly Income × [(1 − (1+r')^(−m)) / r'], where r' = real return rate (nominal − inflation), m = months in retirement.\n\nThe gap between your projected fund and required fund shows whether you need to save more or can retire earlier.",
      ko: "계산은 두 단계로 진행됩니다.\n\n1. 축적 단계 (현재 → 은퇴): 현재 저축액과 매월 적립금이 복리로 성장하는 미래가치를 계산합니다: FV = PV(1+r)^n + PMT × [((1+r)^n − 1) / r]\n\n2. 인출 단계 (은퇴 → 기대수명): 은퇴 후 매월 생활비를 인출할 때 자금이 얼마나 유지되는지 계산합니다. 필요 자금 = 월 생활비 × [(1 − (1+r')^(−m)) / r']. 여기서 r' = 실질수익률(명목수익률 − 물가상승률), m = 은퇴 후 개월 수.\n\n예상 적립 금액과 필요 자금의 차이를 통해 추가 저축 필요 여부를 판단할 수 있습니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Retirement planning involves many variables including market volatility, inflation changes, healthcare costs, and life expectancy. This calculator uses simplified assumptions and fixed rates. Work with a certified financial planner for a comprehensive retirement plan.",
      ko: "은퇴 계획은 시장 변동, 물가 상승, 의료비, 기대수명 등 다양한 변수에 영향을 받습니다. 본 계산기는 고정 수익률과 단순화된 가정을 사용한 추정치입니다. 종합적인 노후 설계는 재무설계사와 상담하시기 바랍니다."
    }
  },

  "emergency-fund-calculator": {
    about: {
      en: "The Emergency Fund Calculator determines how much money you should set aside for unexpected expenses like job loss, medical emergencies, or major repairs. Based on your monthly essential expenses, income stability, and personal circumstances, it recommends an appropriate emergency fund target.",
      ko: "비상자금 계산기는 실직, 질병, 차량 수리 등 예상치 못한 상황에 대비해 얼마를 준비해야 하는지 알려주는 도구입니다. 월 필수 생활비, 소득 안정성, 부양가족 수 등을 고려하여 적정 비상자금 규모와 목표 달성까지 필요한 저축 기간을 계산합니다."
    },
    howItWorks: {
      en: "The recommended emergency fund is calculated as: Monthly Essential Expenses × Recommended Months.\n\nThe number of recommended months varies by risk profile:\n• Stable employment (government, large corp): 3–4 months\n• Average stability: 5–6 months\n• Freelance/self-employed or single income: 7–9 months\n• High risk (commission-based, seasonal work): 9–12 months\n\nMonthly essential expenses include: housing, utilities, food, transportation, insurance, and debt payments. Discretionary spending is excluded. The calculator also shows how many months of saving at your chosen rate it will take to reach the target.",
      ko: "적정 비상자금 = 월 필수 생활비 × 권장 개월 수.\n\n권장 개월 수는 소득 안정성에 따라 달라집니다:\n• 안정 직장(공무원, 대기업): 3~4개월\n• 보통 수준: 5~6개월\n• 프리랜서/자영업/외벌이: 7~9개월\n• 고위험(영업직, 계절 근무): 9~12개월\n\n월 필수 생활비에는 주거비, 공과금, 식비, 교통비, 보험료, 대출 상환금이 포함되며, 여가·쇼핑 등 선택 지출은 제외됩니다. 현재 저축 가능 금액을 입력하면 목표 달성까지 소요 기간도 확인할 수 있습니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "The recommended emergency fund size is a general guideline. Your actual needs may differ based on health conditions, dependents, debt levels, and local cost of living. This calculator does not constitute financial advice.",
      ko: "권장 비상자금 규모는 일반적인 가이드라인이며, 건강 상태, 부양가족, 부채 규모, 거주 지역에 따라 실제 필요 금액은 달라질 수 있습니다. 본 계산기는 재무 자문이 아닌 참고용 도구입니다."
    }
  },

  "loan-calculator": {
    about: {
      en: "The Loan Calculator computes your monthly repayment amount, total interest, and full amortization schedule for any type of loan. It supports three Korean repayment methods: equal principal and interest (원리금균등), equal principal (원금균등), and bullet repayment (만기일시). Compare methods side by side to find the best option.",
      ko: "대출 상환 계산기는 원리금균등상환, 원금균등상환, 만기일시상환 세 가지 방식의 월 상환액과 총 이자를 계산합니다. 대출 금액, 금리, 상환 기간을 입력하면 각 방식별 상세 상환 스케줄을 비교할 수 있어, 나에게 가장 유리한 상환 전략을 선택할 수 있습니다."
    },
    howItWorks: {
      en: "Three repayment methods are calculated:\n\n1. Equal Principal & Interest (원리금균등): M = P × [r(1+r)^n] / [(1+r)^n − 1]. Monthly payment stays constant.\n\n2. Equal Principal (원금균등): Principal portion = P/n (constant). Interest = Remaining Balance × r. Monthly payment decreases over time.\n\n3. Bullet Repayment (만기일시): Monthly payment = P × r (interest only). Principal repaid in full at maturity.\n\nWhere P = loan amount, r = monthly rate, n = total months. The calculator generates a month-by-month breakdown showing principal, interest, and remaining balance for each method.",
      ko: "세 가지 상환 방식의 계산 공식:\n\n1. 원리금균등상환: M = P × [r(1+r)^n] / [(1+r)^n − 1]. 매월 동일한 금액을 납부합니다.\n\n2. 원금균등상환: 원금 상환분 = P/n (매월 동일). 이자 = 잔금 × 월이율. 매월 납입액이 점차 줄어듭니다.\n\n3. 만기일시상환: 매월 이자(P × r)만 납부하고, 만기에 원금을 일시 상환합니다.\n\nP = 대출 원금, r = 월 이자율, n = 총 상환 개월 수. 각 방식별로 매월 원금·이자·잔금 내역을 상세히 보여줍니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Calculated amounts are based on the interest rate and term you enter. Actual loan terms include origination fees, late payment penalties, and variable rate adjustments not reflected here. Contact your financial institution for official repayment schedules.",
      ko: "계산 결과는 입력하신 금리와 기간을 기준으로 한 추정치입니다. 실제 대출에는 수수료, 중도상환수수료, 변동금리 등이 적용될 수 있습니다. 정확한 상환 스케줄은 해당 금융기관에 확인하시기 바랍니다."
    }
  },

  "vat-calculator": {
    about: {
      en: "The VAT Calculator quickly computes Korea's 10% Value-Added Tax. Enter either the supply price (before tax) to get the VAT-inclusive total, or enter the total amount to extract the VAT component. Perfect for business owners, accountants, and anyone issuing or checking tax invoices.",
      ko: "부가세 계산기는 공급가액에서 부가가치세(10%)를 더한 합계금액을 계산하거나, 합계금액에서 공급가액과 부가세를 역산할 수 있는 도구입니다. 세금계산서 발행, 견적서 작성, 매입·매출 정리 시 빠르게 부가세를 확인할 수 있습니다."
    },
    howItWorks: {
      en: "Korea's standard VAT rate is 10%.\n\n• Forward calculation (supply price → total): VAT = Supply Price × 10%. Total = Supply Price + VAT = Supply Price × 1.1\n\n• Reverse calculation (total → supply price): Supply Price = Total ÷ 1.1. VAT = Total − Supply Price = Total ÷ 11\n\nThe calculator handles both directions instantly and displays all three values: supply price, VAT amount, and total (VAT-inclusive price). It also supports batch calculation for multiple items.",
      ko: "한국의 부가가치세율은 10%입니다.\n\n• 정방향 계산 (공급가액 → 합계): 부가세 = 공급가액 × 10%. 합계금액 = 공급가액 × 1.1\n\n• 역방향 계산 (합계 → 공급가액): 공급가액 = 합계금액 ÷ 1.1. 부가세 = 합계금액 − 공급가액 = 합계금액 ÷ 11\n\n두 방향 모두 즉시 계산되며, 공급가액·부가세·합계금액 세 가지를 한눈에 확인할 수 있습니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "This calculator uses the standard 10% VAT rate. Some goods and services are VAT-exempt or zero-rated. For tax filing purposes, consult a tax professional or the National Tax Service.",
      ko: "본 계산기는 표준 부가세율 10%를 적용합니다. 면세 품목이나 영세율 대상은 별도 규정이 적용됩니다. 세금 신고 시에는 세무사나 국세청에 확인하시기 바랍니다."
    }
  },

  "severance-calculator": {
    about: {
      en: "The Severance Pay Calculator estimates your legally mandated retirement allowance under Korean labor law. By entering your employment start/end dates and average monthly salary, you can calculate the severance pay you are entitled to upon leaving your job after at least one year of continuous service.",
      ko: "퇴직금 계산기는 근로기준법에 따른 법정 퇴직금을 산출하는 도구입니다. 입사일, 퇴사일, 최근 3개월 평균임금을 입력하면 퇴직금과 퇴직소득세 예상액을 확인할 수 있습니다. 1년 이상 근무한 모든 근로자가 받을 수 있는 퇴직금을 미리 계산해 보세요."
    },
    howItWorks: {
      en: "Under Korean Labor Standards Act, severance pay is calculated as:\n\nSeverance Pay = Average Daily Wage × 30 days × (Total Service Days / 365)\n\nAverage Daily Wage = Total wages for the last 3 months ÷ Total calendar days in those 3 months.\n\nTotal wages include base salary, fixed allowances, and regular bonuses (annual bonus ÷ 12 × 3). Overtime pay and irregular bonuses may also be included depending on regularity. The calculator computes the gross severance and estimates the retirement income tax using the simplified formula based on years of service.",
      ko: "퇴직금은 근로기준법에 따라 다음과 같이 계산됩니다:\n\n퇴직금 = 1일 평균임금 × 30일 × (재직일수 / 365)\n\n1일 평균임금 = 퇴직 전 3개월간 총 임금 ÷ 해당 기간 총 일수\n\n총 임금에는 기본급, 고정수당, 정기상여금(연간 상여금 ÷ 12 × 3)이 포함됩니다. 연장근로수당이나 비정기 상여금도 정기성이 인정되면 포함될 수 있습니다. 계산기는 퇴직소득세도 근속연수에 따른 간편 공식으로 추정합니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Severance pay calculations depend on what constitutes 'average wages' under labor law, which can be complex. Bonuses, overtime, and allowances may or may not be included. For disputes or exact amounts, consult a labor attorney or the Ministry of Employment and Labor.",
      ko: "퇴직금 산정의 핵심인 '평균임금'에 포함되는 항목은 개별 근로 조건에 따라 다를 수 있습니다. 정확한 퇴직금은 고용노동부 상담(1350) 또는 노무사에게 문의하시기 바랍니다."
    }
  },

  "rent-conversion-calculator": {
    about: {
      en: "The Jeonse-Wolse Conversion Calculator converts between Korea's unique Jeonse (lump-sum deposit) and Wolse (monthly rent) systems. Enter a Jeonse deposit to find the equivalent monthly rent, or vice versa, using the official conversion rate. Essential for Korean renters comparing housing options.",
      ko: "전월세 전환 계산기는 전세 보증금을 월세로, 또는 월세를 전세 보증금으로 환산하는 도구입니다. 전월세전환율을 적용하여 두 임대 방식의 실질 비용을 비교할 수 있습니다. 이사나 계약 갱신 시 어떤 방식이 더 유리한지 판단하는 데 활용하세요."
    },
    howItWorks: {
      en: "The conversion uses the Jeonse-Wolse conversion rate set by the government or agreed upon between landlord and tenant.\n\n• Jeonse → Wolse: Monthly Rent = (Jeonse Deposit − Wolse Deposit) × Conversion Rate ÷ 12\n\n• Wolse → Jeonse: Additional Jeonse = Monthly Rent × 12 ÷ Conversion Rate. Total Jeonse = Wolse Deposit + Additional Jeonse\n\nThe legal cap on conversion rate = Bank base rate + 3.5% (as per Housing Lease Protection Act). The calculator also shows the effective annual cost comparison including opportunity cost of the deposit.",
      ko: "전월세 전환은 전월세전환율을 기준으로 계산됩니다.\n\n• 전세 → 월세: 월세 = (전세보증금 − 월세보증금) × 전환율 ÷ 12\n\n• 월세 → 전세: 전환 보증금 = 월세 × 12 ÷ 전환율. 전세보증금 = 월세보증금 + 전환 보증금\n\n주택임대차보호법상 전환율 상한은 한국은행 기준금리 + 3.5%입니다. 보증금의 기회비용(예금 이자 등)을 포함한 실질 연간 주거비 비교도 함께 제공합니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "The conversion rate used may differ from the rate agreed in your actual lease contract. Legal cap rates change with the Bank of Korea base rate. This tool is for comparison purposes only and does not constitute legal advice.",
      ko: "적용되는 전환율은 실제 임대차 계약에서 합의된 비율과 다를 수 있습니다. 법정 상한율은 기준금리 변동에 따라 달라집니다. 본 계산기는 비교 참고용이며 법률 자문이 아닙니다."
    }
  },

  "income-tax-calculator": {
    about: {
      en: "The Comprehensive Income Tax Calculator estimates your annual Korean income tax for all taxable income sources including business, freelance, rental, interest, and dividend income. It applies progressive tax brackets, deductions, and credits to compute your final tax liability or expected refund.",
      ko: "종합소득세 계산기는 사업소득, 프리랜서 소득, 임대소득, 이자·배당소득 등 모든 과세 소득을 합산하여 종합소득세 예상 납부액을 계산합니다. 누진세율 적용, 각종 소득공제·세액공제를 반영하여 5월 확정신고 전 세금 부담을 미리 파악할 수 있습니다."
    },
    howItWorks: {
      en: "The calculation follows the Korean income tax structure:\n\n1. Gross Income: Sum of all income sources\n2. Necessary Expenses: Deducted by income type (business: actual or standard rates)\n3. Income Deductions: Basic (₩1.5M), dependents, pension contributions, health insurance, etc.\n4. Taxable Income = Gross Income − Expenses − Deductions\n5. Calculated Tax using progressive brackets: 6% (≤₩14M), 15% (≤₩50M), 24% (≤₩88M), 35% (≤₩150M), 38% (≤₩300M), 40% (≤₩500M), 42% (≤₩1B), 45% (>₩1B)\n6. Tax Credits: child credit, retirement pension credit, standard credit, etc.\n7. Final Tax = Calculated Tax − Tax Credits + Local Income Tax (10%)",
      ko: "종합소득세는 다음 순서로 계산됩니다:\n\n1. 총수입금액: 모든 소득원 합산\n2. 필요경비: 소득 유형별 공제 (사업소득: 실제경비 또는 경비율)\n3. 소득공제: 기본공제(150만 원), 부양가족, 연금보험료, 건강보험료 등\n4. 과세표준 = 총수입 − 필요경비 − 소득공제\n5. 누진세율 적용: 1,400만 원 이하 6%, 5,000만 원 이하 15%, 8,800만 원 이하 24%, 1.5억 이하 35%, 3억 이하 38%, 5억 이하 40%, 10억 이하 42%, 10억 초과 45%\n6. 세액공제: 자녀세액공제, 퇴직연금세액공제, 표준세액공제 등\n7. 최종 세액 = 산출세액 − 세액공제 + 지방소득세(10%)"
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Tax laws change annually. This calculator reflects general tax brackets and common deductions but cannot account for every individual situation. For accurate tax filing, use the National Tax Service's Hometax system or consult a certified tax accountant.",
      ko: "세법은 매년 개정됩니다. 본 계산기는 일반적인 세율과 주요 공제 항목을 반영한 추정치이며, 모든 개인 상황을 반영하지 못합니다. 정확한 신고는 국세청 홈택스 또는 세무사를 이용하시기 바랍니다."
    }
  },

  "car-tax-calculator": {
    about: {
      en: "The Car Tax Calculator estimates your annual Korean automobile tax based on vehicle type, engine displacement, and vehicle age. It also shows the prepayment discount if you pay your full year's car tax in January. Useful for budgeting vehicle ownership costs or comparing taxes between different cars.",
      ko: "자동차세 계산기는 차량 종류, 배기량, 차령(연식)을 기반으로 연간 자동차세를 계산합니다. 1월 연납 시 할인 금액도 함께 확인할 수 있어, 차량 유지비 예산 수립이나 신차·중고차 구매 시 세금 비교에 활용됩니다."
    },
    howItWorks: {
      en: "Korean car tax is based on engine displacement (cc):\n\n• Non-commercial passenger cars:\n  - Up to 1,000cc: ₩80/cc per year\n  - 1,001–1,600cc: ₩140/cc per year\n  - Over 1,600cc: ₩200/cc per year\n\n• Electric vehicles: flat rate ₩100,000/year\n\nVehicle age discount: Starting from the 3rd year, 5% discount per year (up to 50% max).\n\nAnnual Tax = Base Tax × (1 − Age Discount Rate). Prepayment discount: ~5% if paid in full in January. Local education tax (30% of car tax) is added to the total. The tax is normally paid in two installments (June and December).",
      ko: "자동차세는 배기량(cc) 기준으로 산정됩니다:\n\n• 비영업용 승용차:\n  - 1,000cc 이하: cc당 80원/년\n  - 1,001~1,600cc: cc당 140원/년\n  - 1,600cc 초과: cc당 200원/년\n\n• 전기차: 연 10만 원 정액\n\n차령 경감: 최초 등록 후 3년째부터 매년 5%씩 경감 (최대 50%).\n\n연간 세액 = 기본 세액 × (1 − 차령 경감률). 1월 연납 시 약 5% 할인. 지방교육세(자동차세의 30%)가 추가됩니다. 자동차세는 6월과 12월에 반기별로 부과됩니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Tax rates and discount policies are set by Korean local governments and may change. Electric and hybrid vehicle tax benefits have expiration dates. Verify current rates with your local district office or Wetax (www.wetax.go.kr).",
      ko: "자동차세율과 할인 정책은 지방자치단체에서 정하며 변경될 수 있습니다. 전기차·하이브리드 세제 혜택은 일몰 기한이 있습니다. 최신 세율은 위택스(www.wetax.go.kr) 또는 관할 구청에서 확인하세요."
    }
  },

  "capital-gains-tax-calculator": {
    about: {
      en: "The Capital Gains Tax Calculator estimates the tax you owe when selling real estate in Korea. It factors in acquisition cost, selling price, holding period, and applicable deductions to calculate your taxable gain and the corresponding tax under Korea's progressive CGT system.",
      ko: "양도소득세 계산기는 부동산 매도 시 발생하는 양도차익에 대한 세금을 추정합니다. 취득가액, 양도가액, 보유 기간, 필요경비를 입력하면 양도소득금액, 과세표준, 예상 세액을 단계별로 확인할 수 있습니다. 부동산 매도 전 세금 부담을 미리 파악하세요."
    },
    howItWorks: {
      en: "Capital gains tax on real estate in Korea is calculated as:\n\n1. Capital Gain = Selling Price − Acquisition Cost − Necessary Expenses (agent fees, renovation costs, etc.)\n2. Long-term Holding Deduction: 2–4% per year for holding 3+ years (up to 30%), additional for 2+ years of residence (up to 80% total for 1-house owners)\n3. Taxable Gain = Capital Gain − Long-term Holding Deduction − Basic Deduction (₩2.5M/year)\n4. Tax = Taxable Gain × Progressive Rate (6%–45%) − Progressive Deduction\n\nMulti-home owners face surcharges: +20% for 2 homes, +30% for 3+ homes (when regulated). 1-house owners with 2+ years holding and residence may be fully exempt up to ₩1.2B.",
      ko: "부동산 양도소득세 계산 과정:\n\n1. 양도차익 = 양도가액 − 취득가액 − 필요경비(중개수수료, 수리비 등)\n2. 장기보유특별공제: 3년 이상 보유 시 연 2~4% (최대 30%), 거주 2년 이상 시 추가 공제 (1세대 1주택 최대 80%)\n3. 양도소득금액 = 양도차익 − 장기보유특별공제 − 기본공제(연 250만 원)\n4. 세액 = 과세표준 × 누진세율(6%~45%) − 누진공제액\n\n다주택자 중과: 조정대상지역 2주택 +20%, 3주택 이상 +30%. 1세대 1주택자는 보유·거주 요건 충족 시 양도가액 12억 원 이하 비과세 적용이 가능합니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Capital gains tax rules for Korean real estate are complex and change frequently, especially regarding multi-home surcharges and regulated areas. This calculator provides rough estimates only. Consult a tax accountant before selling property.",
      ko: "부동산 양도소득세는 규제지역 지정, 다주택 중과, 비과세 요건 등이 수시로 변경되는 복잡한 세목입니다. 본 계산기는 참고용 추정치이며, 매도 전 반드시 세무사와 상담하시기 바랍니다."
    }
  },

  "acquisition-tax-calculator": {
    about: {
      en: "The Acquisition Tax Calculator estimates the taxes and fees due when purchasing property in Korea. It calculates acquisition tax, local education tax, and special rural development tax based on the property type, price, and your homeowner status. Plan your total purchase budget beyond just the property price.",
      ko: "취득세 계산기는 부동산 매수 시 납부해야 하는 취득세, 지방교육세, 농어촌특별세를 계산합니다. 주택 가격, 주택 수, 조정대상지역 여부에 따라 달라지는 세율을 반영하여 총 취득 부대비용을 파악할 수 있습니다."
    },
    howItWorks: {
      en: "Acquisition tax rates for housing in Korea vary by property value and number of homes owned:\n\n• 1-home purchase:\n  - ≤₩600M: 1%\n  - ₩600M–₩900M: 1–3% (sliding scale)\n  - >₩900M: 3%\n\n• 2nd home (regulated area): 8%\n• 3rd+ home (regulated area): 12%\n\nAdditional taxes:\n  - Local Education Tax: 0.1–0.4% of property value\n  - Special Rural Development Tax: 0.2% (for properties >₩600M)\n\nTotal Tax = Acquisition Tax + Local Education Tax + Special Rural Development Tax. The calculator also factors in whether the area is designated as a regulated zone.",
      ko: "주택 취득세율은 주택 가격과 보유 주택 수에 따라 달라집니다:\n\n• 1주택 취득:\n  - 6억 원 이하: 1%\n  - 6억~9억 원: 1~3% (구간별 차등)\n  - 9억 원 초과: 3%\n\n• 2주택 (조정대상지역): 8%\n• 3주택 이상 (조정대상지역): 12%\n\n부가세목:\n  - 지방교육세: 취득세의 10% (일부 구간별 차이)\n  - 농어촌특별세: 0.2% (6억 초과 주택)\n\n총 세액 = 취득세 + 지방교육세 + 농어촌특별세. 조정대상지역 여부에 따라 중과세율이 적용됩니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Acquisition tax rates depend on government regulations that change frequently, including regulated area designations. Special exemptions may apply for first-time buyers, newlyweds, or certain property types. Confirm the applicable rate with your local tax office before closing.",
      ko: "취득세율은 조정대상지역 지정·해제, 정책 변동에 따라 수시로 변경됩니다. 생애최초 주택 구매, 신혼부부 감면 등 특례가 적용될 수 있습니다. 계약 전 관할 세무서에서 최신 세율을 확인하시기 바랍니다."
    }
  },

  "loan-comparison-calculator": {
    about: {
      en: "The Loan Comparison Calculator lets you compare up to three loan offers side by side. Enter different interest rates, terms, and fee structures to see which loan saves you the most money over its lifetime. It highlights total cost differences and monthly payment variations to help you choose the best deal.",
      ko: "대출 비교 계산기는 최대 3개의 대출 상품을 나란히 비교할 수 있는 도구입니다. 금리, 상환 기간, 수수료가 다른 대출 옵션의 월 상환액과 총 상환액 차이를 한눈에 보여주어, 가장 유리한 대출을 선택하는 데 도움을 줍니다."
    },
    howItWorks: {
      en: "For each loan option, the calculator computes:\n\n1. Monthly Payment: M = P × [r(1+r)^n] / [(1+r)^n − 1] (equal principal & interest method)\n2. Total Repayment = Monthly Payment × Number of Months\n3. Total Interest = Total Repayment − Loan Principal\n4. Total Cost = Total Interest + Origination Fees + Other Charges\n5. Effective Annual Rate = adjusted rate including all fees\n\nThe comparison table shows the difference in total cost between each option. A lower monthly payment doesn't always mean a cheaper loan — a longer term increases total interest. The calculator helps you see this trade-off clearly.",
      ko: "각 대출 옵션별로 다음을 계산합니다:\n\n1. 월 상환액: M = P × [r(1+r)^n] / [(1+r)^n − 1] (원리금균등상환 기준)\n2. 총 상환액 = 월 상환액 × 상환 개월 수\n3. 총 이자 = 총 상환액 − 대출 원금\n4. 총 비용 = 총 이자 + 대출 수수료 + 기타 비용\n5. 실효금리 = 모든 비용을 포함한 실질 연이율\n\n비교표에서 각 옵션 간 총 비용 차이를 확인할 수 있습니다. 월 상환액이 적다고 반드시 유리한 것은 아닙니다. 상환 기간이 길면 총 이자가 증가하는 트레이드오프를 명확히 보여줍니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Loan comparison results are based on the information you provide. Actual loan offers include additional factors like prepayment penalties, rate adjustment periods for variable rates, and credit score requirements. Always review the full loan contract before signing.",
      ko: "대출 비교 결과는 입력하신 정보를 기반으로 한 추정치입니다. 실제 대출에는 중도상환수수료, 변동금리 조정 주기, 신용등급 조건 등이 추가로 적용됩니다. 계약 전 대출 약정서를 꼼꼼히 확인하세요."
    }
  },

  "dsr-calculator": {
    about: {
      en: "The DSR (Debt Service Ratio) Calculator computes your total debt-to-income ratio, which Korean banks use to determine your maximum borrowable amount. Enter your annual income and all existing loan repayments to check if you meet the DSR threshold (typically 40% for banks, 50% for non-bank lenders).",
      ko: "DSR(총부채원리금상환비율) 계산기는 연소득 대비 모든 대출의 연간 원리금 상환액 비율을 계산합니다. 주담대, 신용대출, 자동차 할부 등 모든 부채를 반영하여 현재 DSR 비율과 추가 대출 가능 한도를 확인할 수 있습니다."
    },
    howItWorks: {
      en: "DSR = (Total Annual Loan Repayments ÷ Annual Income) × 100%\n\nTotal Annual Loan Repayments include:\n• Mortgage: annual principal + interest payments\n• Credit loans: annual repayments (or minimum if revolving)\n• Auto loans: annual installment payments\n• Student loans: annual repayments\n• Any other debt obligations\n\nKorean regulations (as of recent policy):\n• Banks: DSR cap of 40%\n• Non-bank financial institutions: DSR cap of 50%\n• Stress DSR: applied with a buffer rate (+0.25%–1.5%) above current rates\n\nMaximum Additional Borrowing = [(DSR Limit × Annual Income) − Current Annual Repayments] converted to loan principal using the amortization formula.",
      ko: "DSR = (연간 총 대출 원리금 상환액 ÷ 연소득) × 100%\n\n연간 원리금 상환액에 포함되는 항목:\n• 주택담보대출: 연간 원금 + 이자 상환액\n• 신용대출: 연간 상환액 (마이너스 통장은 약정에 따라)\n• 자동차 할부: 연간 할부금\n• 학자금 대출: 연간 상환액\n• 기타 모든 부채\n\n규제 기준:\n• 은행권: DSR 40%\n• 비은행권: DSR 50%\n• 스트레스 DSR: 현재 금리에 가산금리(+0.25%~1.5%) 적용\n\n추가 대출 가능액 = [(DSR 한도 × 연소득) − 현재 연간 상환액]을 원리금균등상환 공식으로 원금 환산."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "DSR regulations and thresholds are subject to change by the Financial Services Commission. Each financial institution may apply different criteria for income verification and loan classification. Contact your lender for an official DSR assessment.",
      ko: "DSR 규제 기준과 한도는 금융위원회 정책에 따라 변경될 수 있습니다. 소득 인정 범위와 대출 분류 기준은 금융기관마다 다릅니다. 정확한 DSR 심사는 해당 금융기관에 문의하세요."
    }
  },

  "inheritance-tax-calculator": {
    about: {
      en: "The Inheritance Tax Calculator estimates the Korean inheritance tax on an estate. It accounts for the total estate value, debts, funeral expenses, and various exemptions (spouse deduction, family deduction, financial asset deduction) to calculate the taxable amount and corresponding tax under Korea's progressive inheritance tax rates.",
      ko: "상속세 계산기는 상속재산 총액에서 채무, 장례비용, 각종 공제(배우자공제, 일괄공제, 금융재산공제 등)를 차감한 과세표준에 누진세율을 적용하여 상속세 예상액을 산출합니다. 상속 발생 전 세금 부담을 미리 가늠하고 절세 전략을 세우는 데 활용하세요."
    },
    howItWorks: {
      en: "Korean inheritance tax calculation:\n\n1. Gross Estate = Real estate + Financial assets + Other assets (at market value)\n2. Deductions from estate: Debts, funeral costs (up to ₩15M), charitable donations\n3. Taxable Estate = Gross Estate − Deductions\n4. Exemptions: Basic deduction (₩500M lump-sum or itemized), Spouse deduction (₩500M–₩3B), Financial asset deduction (up to ₩200M)\n5. Taxable Amount = Taxable Estate − Exemptions\n6. Tax rates: 10% (≤₩100M), 20% (≤₩500M), 30% (≤₩1B), 40% (≤₩3B), 50% (>₩3B)\n7. Tax credits: Quick-succession credit, foreign tax credit\n\nSpouse deduction alone can significantly reduce or eliminate tax for smaller estates.",
      ko: "상속세 계산 과정:\n\n1. 총 상속재산 = 부동산 + 금융자산 + 기타 자산 (시가 기준)\n2. 차감 항목: 채무, 장례비용(최대 1,500만 원), 공익법인 출연\n3. 상속세 과세가액 = 총 상속재산 − 차감 항목\n4. 공제: 일괄공제(5억 원) 또는 기초·인적공제 합산, 배우자공제(5억~30억 원), 금융재산공제(최대 2억 원)\n5. 과세표준 = 과세가액 − 공제액\n6. 세율: 1억 이하 10%, 5억 이하 20%, 10억 이하 30%, 30억 이하 40%, 30억 초과 50%\n7. 세액공제: 단기재상속 세액공제, 외국납부 세액공제\n\n배우자공제만으로도 소규모 상속의 경우 세금을 크게 줄이거나 면세받을 수 있습니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Inheritance tax involves complex asset valuation (especially real estate appraisals), pre-inheritance gifts within 10 years, and family-specific deduction calculations. This tool provides rough estimates. Engage an estate planning attorney or tax accountant well before the need arises.",
      ko: "상속세는 재산 평가(특히 부동산 감정), 10년 이내 사전 증여 합산, 가족 구성에 따른 공제 계산이 복잡합니다. 본 계산기는 개략적 추정치이며, 정확한 상속세 계산은 세무사나 상속 전문 변호사와 상담하시기 바랍니다."
    }
  },

  "national-pension-calculator": {
    about: {
      en: "The National Pension Calculator estimates your expected monthly pension benefit upon retirement based on your contribution history. Enter your average monthly income, total contribution years, and expected retirement age to project how much you will receive from Korea's National Pension Service (NPS).",
      ko: "국민연금 수령액 계산기는 가입 기간과 평균 소득을 기반으로 노령연금 예상 수령액을 산출합니다. 현재 소득, 가입 기간, 수령 개시 나이를 입력하면 매월 받을 수 있는 국민연금 금액을 미리 확인할 수 있습니다."
    },
    howItWorks: {
      en: "The NPS old-age pension benefit formula:\n\nMonthly Pension = Base Amount × (1 + 0.05 × (n − 20)) for n ≥ 20 years, where n = contribution years.\n\nBase Amount = 1.485 × (A + B) × (n/40). A = average monthly income of all NPS members (adjusted annually), B = your career average monthly income (revalued).\n\nKey adjustments:\n• Early pension (before age 65): reduced by 6% per year (up to 5 years early = 30% reduction)\n• Deferred pension (after age 65): increased by 7.2% per year (up to 5 years = 36% increase)\n• Pension amounts are adjusted annually for inflation (CPI-linked).",
      ko: "국민연금 노령연금 산식:\n\n기본연금액 = 1.485 × (A + B) × (n/40). A = 전체 가입자 평균소득월액(매년 조정), B = 본인의 가입기간 평균소득월액(재평가), n = 가입 기간(년).\n\n주요 조정 사항:\n• 조기노령연금(65세 이전): 1년 앞당길 때마다 6% 감액 (최대 5년 = 30% 감액)\n• 연기연금(65세 이후): 1년 늦출 때마다 7.2% 증액 (최대 5년 = 36% 증액)\n• 연금액은 매년 소비자물가 상승률에 연동하여 조정됩니다.\n\n최소 가입 기간 10년 이상이어야 노령연금을 수령할 수 있습니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Pension estimates are based on current NPS formulas and may change with future pension reform legislation. Actual benefits depend on your verified contribution record. Check your official estimate at the NPS website (nps.or.kr) or by calling 1355.",
      ko: "연금 추정액은 현행 국민연금 산식을 기준으로 하며, 향후 연금 개혁에 따라 변경될 수 있습니다. 정확한 수령액은 국민연금공단(nps.or.kr) 또는 1355 상담센터에서 확인하세요."
    }
  },

  "accident-settlement-calculator": {
    about: {
      en: "The Traffic Accident Settlement Calculator provides a rough estimate of compensation amounts for Korean traffic accident cases. It considers medical expenses, lost wages, consolation money (위자료), and disability compensation to help accident victims understand the potential range of their settlement.",
      ko: "교통사고 합의금 계산기는 치료비, 휴업손해, 위자료, 후유장해 보상금 등을 종합하여 교통사고 합의금 예상 범위를 산출합니다. 보험사 합의 전 적정 보상 수준을 가늠하고, 부당하게 낮은 합의금을 방지하는 데 참고할 수 있습니다."
    },
    howItWorks: {
      en: "Traffic accident compensation in Korea generally includes:\n\n1. Medical Expenses: Actual treatment costs (hospital bills, rehabilitation, medication)\n2. Lost Wages: Daily wage × Number of days unable to work. Daily wage = Monthly income ÷ 30 (or minimum wage if unemployed)\n3. Consolation Money (위자료): Fixed amounts based on injury severity (minor: ₩300K–₩1M, moderate: ₩2M–₩5M, severe: ₩5M–₩80M, death: ₩80M–₩100M)\n4. Disability Compensation: For permanent disability, calculated using the McBride disability rating and Leibniz coefficient for future lost earnings\n5. Fault Ratio: Total compensation is adjusted by the victim's contributory negligence percentage\n\nTotal Settlement = (Medical + Lost Wages + Consolation + Disability) × (1 − Victim Fault %)",
      ko: "교통사고 합의금은 일반적으로 다음 항목을 포함합니다:\n\n1. 치료비: 실제 발생한 치료비 (입원비, 통원치료, 약제비)\n2. 휴업손해: 일 소득 × 치료 기간. 일 소득 = 월 소득 ÷ 30 (무직자는 최저임금 기준)\n3. 위자료: 부상 정도별 기준 금액 (경상: 30만~100만 원, 중상: 200만~500만 원, 중상해: 500만~8,000만 원, 사망: 8,000만~1억 원)\n4. 후유장해 보상: 맥브라이드 장해등급과 라이프니츠 계수를 적용한 일실수익 산정\n5. 과실 비율: 피해자 과실 비율만큼 보상금 차감\n\n합의금 = (치료비 + 휴업손해 + 위자료 + 후유장해) × (1 − 피해자 과실비율)"
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Accident settlement amounts are highly case-specific and depend on injury documentation, fault determination, and negotiation. This calculator gives rough reference ranges only. Do not accept or reject any settlement offer based solely on this tool. Consult a traffic accident attorney for proper legal advice.",
      ko: "교통사고 합의금은 사고 경위, 부상 정도, 과실 비율, 증빙 자료에 따라 크게 달라집니다. 본 계산기는 대략적인 참고 범위만 제공합니다. 이 도구만으로 합의에 응하거나 거절하지 마시고, 반드시 교통사고 전문 변호사와 상담하시기 바랍니다."
    }
  },

  "unemployment-calculator": {
    about: {
      en: "The Unemployment Benefits Calculator estimates your Korean employment insurance benefits (실업급여) based on your age, employment period, and previous salary. It shows your daily benefit amount, total benefit period, and estimated total payout to help you plan during a job transition.",
      ko: "실업급여 계산기는 나이, 고용보험 가입 기간, 퇴직 전 평균임금을 기반으로 구직급여 일액, 수급 기간, 총 수령 예상액을 계산합니다. 실직 후 생활비 계획을 세우거나, 이직 전 수급 요건을 확인하는 데 활용하세요."
    },
    howItWorks: {
      en: "Korean unemployment benefits (구직급여) are calculated as:\n\n1. Daily Benefit = Previous Average Daily Wage × 60%\n   - Upper limit: ₩66,000/day\n   - Lower limit: Minimum wage daily equivalent × 80%\n\n2. Benefit Duration depends on age and insured period:\n   - Under 50, <1yr insured: 120 days\n   - Under 50, 1–3yr: 150 days\n   - Under 50, 3–5yr: 180 days\n   - Under 50, 5–10yr: 210 days\n   - Under 50, 10yr+: 240 days\n   - 50+ or disabled: add 30 days to each tier (max 270 days)\n\n3. Total Benefit = Daily Benefit × Benefit Duration\n\nPrevious Average Daily Wage = Total wages for last 3 months ÷ Total calendar days.",
      ko: "구직급여 계산 방법:\n\n1. 구직급여 일액 = 퇴직 전 평균임금 × 60%\n   - 상한액: 일 66,000원\n   - 하한액: 최저임금 일액의 80%\n\n2. 소정급여일수 (나이 + 가입기간):\n   - 50세 미만, 1년 미만: 120일\n   - 50세 미만, 1~3년: 150일\n   - 50세 미만, 3~5년: 180일\n   - 50세 미만, 5~10년: 210일\n   - 50세 미만, 10년 이상: 240일\n   - 50세 이상 또는 장애인: 각 구간 +30일 (최대 270일)\n\n3. 총 수령액 = 구직급여 일액 × 소정급여일수\n\n퇴직 전 평균임금 = 최근 3개월 총 임금 ÷ 해당 기간 총 일수."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Eligibility for unemployment benefits requires involuntary separation, 180+ days of insured employment in the last 18 months, and active job seeking. Voluntary resignation generally disqualifies you unless specific exceptions apply. Verify eligibility at your local Employment Center or www.ei.go.kr.",
      ko: "실업급여 수급 자격은 비자발적 퇴직, 최근 18개월 중 180일 이상 고용보험 가입, 적극적 구직 활동 등 요건을 충족해야 합니다. 자발적 퇴사는 원칙적으로 수급이 불가합니다. 정확한 자격은 고용센터(1350) 또는 고용보험 사이트(ei.go.kr)에서 확인하세요."
    }
  },

  "weekly-pay-calculator": {
    about: {
      en: "The Weekly Pay Calculator converts your hourly wage into weekly earnings, accounting for regular hours, overtime, and the Korean weekly holiday allowance (주휴수당). It helps part-time workers and hourly employees understand their true weekly income including legally mandated allowances.",
      ko: "주급 계산기는 시급과 주간 근무시간을 입력하면 기본급, 연장근로수당, 주휴수당을 포함한 실제 주급을 계산합니다. 아르바이트생이나 시간제 근로자가 한 주에 실제로 받는 금액을 정확히 파악할 수 있습니다."
    },
    howItWorks: {
      en: "Weekly pay calculation includes:\n\n1. Base Pay = Hourly Wage × Weekly Regular Hours (up to 40 hours)\n2. Overtime Pay = Hourly Wage × 1.5 × Overtime Hours (hours exceeding 40/week)\n3. Weekly Holiday Allowance (주휴수당): If you work 15+ hours/week consistently, you receive 1 additional paid day. Weekly Holiday Pay = Hourly Wage × (Weekly Hours / 40) × 8 hours\n\nTotal Weekly Pay = Base Pay + Overtime Pay + Weekly Holiday Allowance\n\nFor night work (10 PM–6 AM), an additional 50% premium applies. Holiday work also carries a 50% premium, stackable with overtime and night premiums.",
      ko: "주급 계산 구성:\n\n1. 기본급 = 시급 × 주간 소정근로시간 (최대 40시간)\n2. 연장근로수당 = 시급 × 1.5 × 연장근로시간 (주 40시간 초과분)\n3. 주휴수당: 주 15시간 이상 근무 시 유급 주휴일 1일 발생. 주휴수당 = 시급 × (주 근무시간 / 40) × 8시간\n\n총 주급 = 기본급 + 연장근로수당 + 주휴수당\n\n야간근로(22시~06시)는 50% 가산, 휴일근로도 50% 가산되며, 연장·야간·휴일 가산은 중복 적용됩니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Overtime and premium pay rules may differ for workplaces with fewer than 5 employees. Weekly holiday allowance eligibility requires consistent weekly hours of 15 or more. Verify your specific entitlements with the Ministry of Employment and Labor (1350).",
      ko: "5인 미만 사업장은 연장·야간·휴일 가산수당 적용이 제외될 수 있습니다. 주휴수당은 주 15시간 이상 소정근로 조건을 충족해야 발생합니다. 정확한 권리는 고용노동부(1350)에 문의하세요."
    }
  },

  "annual-leave-calculator": {
    about: {
      en: "The Annual Leave Calculator computes your accrued annual paid leave days and the monetary value of unused leave (연차수당) under Korean labor law. Enter your hire date and usage to see how many leave days you have earned and what your unused leave is worth in cash.",
      ko: "연차수당 계산기는 근로기준법에 따른 연차유급휴가 발생 일수와 미사용 연차에 대한 수당을 계산합니다. 입사일과 사용 연차를 입력하면 남은 연차 일수와 연차수당 예상 금액을 확인할 수 있습니다."
    },
    howItWorks: {
      en: "Annual leave accrual under Korean Labor Standards Act:\n\n• First year: 1 day per month of perfect attendance (up to 11 days)\n• After 1 year: 15 days\n• After 3+ years: 1 additional day for every 2 years worked (max 25 days total)\n  - Formula: 15 + ((Years of Service − 1) ÷ 2) rounded down, capped at 25\n\nAnnual Leave Pay for unused days:\nPay per day = Average Daily Wage (or Ordinary Daily Wage, whichever is higher)\nTotal Annual Leave Pay = Pay per day × Number of unused leave days\n\nAverage Daily Wage = Last 3 months' total wages ÷ Total calendar days in that period.",
      ko: "근로기준법상 연차유급휴가 발생 기준:\n\n• 1년 미만: 1개월 개근 시 1일 발생 (최대 11일)\n• 1년 이상: 15일\n• 3년 이상: 2년마다 1일 추가 (최대 25일)\n  - 공식: 15 + ((근속연수 − 1) ÷ 2) 내림, 상한 25일\n\n미사용 연차수당 계산:\n1일 수당 = 통상임금 또는 평균임금 중 높은 금액\n총 연차수당 = 1일 수당 × 미사용 연차 일수\n\n평균임금 = 최근 3개월 총 임금 ÷ 해당 기간 총 일수. 통상임금 = 월 통상임금 ÷ 월 소정근로시간 × 8시간."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Annual leave calculations can differ based on your company's fiscal year system vs. hire date system. Some employers may have separate leave policies. Unpaid leave or long absences may affect accrual. Consult your HR department or a labor consultant for your specific situation.",
      ko: "연차 산정은 회사의 회계연도 기준과 입사일 기준에 따라 다를 수 있습니다. 무급휴직이나 장기 결근은 연차 발생에 영향을 줄 수 있습니다. 개별 상황은 회사 인사팀이나 노무사에게 확인하시기 바랍니다."
    }
  },

  "hourly-wage-calculator": {
    about: {
      en: "The Hourly Wage Calculator converts annual salary, monthly salary, or daily pay into an equivalent hourly rate. It also checks whether your current pay meets Korea's minimum wage standard. Useful for comparing job offers with different pay structures or verifying legal compliance.",
      ko: "시급 계산기는 연봉, 월급, 일급을 시간당 임금으로 환산하는 도구입니다. 현재 급여가 최저시급을 충족하는지도 자동으로 판별해 줍니다. 급여 체계가 다른 일자리를 비교하거나, 최저임금 위반 여부를 확인할 때 유용합니다."
    },
    howItWorks: {
      en: "Hourly wage conversion formulas:\n\n• From Annual Salary: Hourly Wage = Annual Salary ÷ (Monthly Scheduled Hours × 12). Monthly Scheduled Hours = (Weekly Hours × 52) ÷ 12. For a standard 40-hour week with weekly holiday: (40 + 8) × 52 ÷ 12 = 209 hours/month.\n\n• From Monthly Salary: Hourly Wage = Monthly Salary ÷ 209 hours\n\n• From Daily Pay: Hourly Wage = Daily Pay ÷ 8 hours\n\nMinimum wage check: Compare calculated hourly wage against the current year's minimum wage (₩10,030/hour for 2026). If your hourly rate falls below, a warning is displayed.",
      ko: "시급 환산 공식:\n\n• 연봉 → 시급: 시급 = 연봉 ÷ (월 소정근로시간 × 12). 월 소정근로시간 = (주 근로시간 × 52) ÷ 12. 주 40시간 + 주휴 8시간 기준: (40 + 8) × 52 ÷ 12 = 209시간/월.\n\n• 월급 → 시급: 시급 = 월급 ÷ 209시간\n\n• 일급 → 시급: 시급 = 일급 ÷ 8시간\n\n최저임금 비교: 산출된 시급이 해당 연도 최저시급 이하인 경우 경고를 표시합니다. 비과세 수당이나 상여금은 최저임금 산입 범위에 따라 포함 여부가 달라질 수 있습니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "The standard 209 hours/month assumes a 40-hour workweek with weekly holiday pay. Different working arrangements (part-time, shift work) require adjusted calculations. Minimum wage inclusion rules for bonuses and allowances may change annually. Check the Ministry of Employment and Labor for current standards.",
      ko: "월 209시간은 주 40시간, 주휴 포함 기준입니다. 단시간 근로나 교대 근무는 별도 계산이 필요합니다. 최저임금 산입 범위(상여금, 복리후생비)는 매년 변경될 수 있으므로 고용노동부에서 최신 기준을 확인하세요."
    }
  },

  "weekly-holiday-pay-calculator": {
    about: {
      en: "The Weekly Holiday Pay Calculator (주휴수당 계산기) determines your legally mandated paid weekly rest day allowance under Korean labor law. If you work 15 or more hours per week on a consistent schedule, you are entitled to one paid day off — this tool calculates exactly how much that adds to your pay.",
      ko: "주휴수당 계산기는 주 15시간 이상 근무하는 근로자에게 법적으로 보장되는 유급 주휴일 수당을 계산합니다. 시급과 주간 근로시간만 입력하면 주휴수당 금액, 실질 시급, 월 환산 주휴수당까지 한눈에 확인할 수 있습니다."
    },
    howItWorks: {
      en: "Weekly Holiday Pay is calculated as:\n\nWeekly Holiday Pay = Hourly Wage × Daily Scheduled Hours\nDaily Scheduled Hours = Weekly Scheduled Hours ÷ Number of Working Days per Week\n\nAlternatively (proportional method for part-time): Weekly Holiday Pay = Hourly Wage × (Weekly Hours / 40) × 8\n\nEffective Hourly Wage (including 주휴수당): Hourly Wage × (1 + 8/40) = Hourly Wage × 1.2 (for full-time 40-hour workers)\n\nMonthly Weekly Holiday Pay = Weekly Holiday Pay × (52 ÷ 12) ≈ Weekly Holiday Pay × 4.345\n\nEligibility: Must work 15+ hours per week with a consistent schedule. Workers who miss their full scheduled hours in a given week may lose that week's allowance.",
      ko: "주휴수당 계산 방법:\n\n주휴수당 = 시급 × 1일 소정근로시간\n1일 소정근로시간 = 주 소정근로시간 ÷ 주 근무일수\n\n단시간 근로자 비례 계산: 주휴수당 = 시급 × (주 근무시간 / 40) × 8시간\n\n주휴수당 포함 실질 시급: 시급 × (1 + 8/40) = 시급 × 1.2 (주 40시간 기준)\n\n월 환산 주휴수당 = 주휴수당 × (52 ÷ 12) ≈ 주휴수당 × 4.345\n\n발생 요건: 주 15시간 이상 소정근로, 해당 주 개근. 결근 시 해당 주 주휴수당이 미발생할 수 있습니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Weekly holiday pay eligibility and calculation may vary for irregular schedules, on-call workers, or workplaces with fewer than 5 employees. If your employer does not pay the weekly holiday allowance, this may constitute a labor law violation. Contact the Labor Board (1350) for guidance.",
      ko: "불규칙 근무, 호출 근무 등의 경우 주휴수당 산정이 달라질 수 있습니다. 5인 미만 사업장도 주휴수당은 지급 의무가 있습니다. 미지급 시 근로기준법 위반에 해당하므로 고용노동부(1350)에 신고할 수 있습니다."
    }
  },

  "year-end-tax-calculator": {
    about: {
      en: "The Year-End Tax Settlement Calculator (연말정산 계산기) estimates your tax refund or additional payment from Korea's annual year-end tax adjustment process. Input your salary, deductions (insurance, education, medical, donations, housing), and credits to see if you will get money back or owe more.",
      ko: "연말정산 계산기는 1년간 납부한 근로소득세를 정산하여 환급액 또는 추가 납부액을 예측하는 도구입니다. 급여, 인적공제, 보험료, 의료비, 교육비, 기부금, 주택자금 등 각종 공제 항목을 입력하면 13월의 월급이 얼마인지 미리 확인할 수 있습니다."
    },
    howItWorks: {
      en: "Year-end tax settlement follows these steps:\n\n1. Total Salary − Non-taxable allowances = Gross Taxable Income\n2. Employment Income Deduction (근로소득공제): sliding scale 70%–2% based on income brackets\n3. Income Deductions: Personal (₩1.5M/person), National Pension, Health Insurance, Employment Insurance\n4. Special Deductions: Insurance premiums, medical expenses (>3% of salary), education, housing rent/interest, donations\n5. Taxable Income = Gross − Employment Deduction − Income Deductions − Special Deductions\n6. Calculated Tax = Progressive rates (6%–45%)\n7. Tax Credits: Child credit, retirement pension (12–15%), standard credit (₩130K)\n8. Determined Tax = Calculated Tax − Credits\n9. Refund/Additional = Already withheld − Determined Tax (positive = refund)",
      ko: "연말정산 계산 절차:\n\n1. 총급여 − 비과세 수당 = 총급여액\n2. 근로소득공제: 소득 구간별 70%~2% 차등 적용\n3. 인적공제: 본인·배우자·부양가족 1인당 150만 원 기본공제\n4. 특별소득공제: 보험료, 의료비(총급여 3% 초과분), 교육비, 주택자금(월세·이자), 기부금\n5. 과세표준 = 총급여액 − 근로소득공제 − 인적공제 − 특별소득공제\n6. 산출세액 = 누진세율(6%~45%) 적용\n7. 세액공제: 자녀세액공제, 퇴직연금(12~15%), 표준세액공제(13만 원)\n8. 결정세액 = 산출세액 − 세액공제\n9. 환급/추납 = 기납부세액(매월 원천징수액 합계) − 결정세액 (양수면 환급)"
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Year-end tax settlement involves dozens of deduction items with specific eligibility requirements and documentation. This calculator covers major deductions but cannot reflect every scenario. Use the National Tax Service's simplified year-end settlement service (간소화 서비스) for official calculations.",
      ko: "연말정산에는 수십 가지 공제 항목이 있으며 각각 적용 요건과 한도가 다릅니다. 본 계산기는 주요 공제만 반영한 추정치입니다. 정확한 정산은 국세청 연말정산 간소화 서비스(www.hometax.go.kr)를 이용하세요."
    }
  },

  "jeonse-vs-wolse-calculator": {
    about: {
      en: "The Jeonse vs Wolse Comparison Calculator helps Korean renters decide between a full-deposit lease (전세) and a monthly-rent lease (월세) by analyzing the true total cost of each option. It factors in deposit opportunity cost, tax benefits, and housing stability to provide a comprehensive financial comparison.",
      ko: "전세vs월세 비교 계산기는 전세와 월세 중 어느 쪽이 경제적으로 유리한지 종합 분석하는 도구입니다. 보증금의 기회비용(투자 수익), 월세 세액공제, 전세대출 이자 등을 모두 반영하여 실질 연간 주거비를 비교합니다."
    },
    howItWorks: {
      en: "The comparison calculates the effective annual housing cost for each option:\n\n• Jeonse Cost = Jeonse Loan Interest + Opportunity Cost of Own Deposit\n  - Loan Interest = Jeonse Loan Amount × Annual Interest Rate\n  - Opportunity Cost = Own Deposit × Expected Investment Return Rate\n  - Total Jeonse Annual Cost = Loan Interest + Opportunity Cost − Deposit Appreciation (if any)\n\n• Wolse Cost = (Monthly Rent × 12) + Opportunity Cost of Wolse Deposit − Monthly Rent Tax Credit\n  - Tax Credit: Up to 17% of annual rent for eligible renters (income ≤₩70M)\n\nThe calculator compares both totals and shows the annual cost difference. A break-even analysis shows at what interest rate or rent level the two options equalize.",
      ko: "각 옵션의 실질 연간 주거비를 계산하여 비교합니다:\n\n• 전세 비용 = 전세대출 이자 + 자기자본 기회비용\n  - 대출이자 = 전세대출금 × 연이율\n  - 기회비용 = 자기 보증금 × 예상 투자수익률\n  - 전세 연간 비용 = 대출이자 + 기회비용\n\n• 월세 비용 = (월세 × 12) + 보증금 기회비용 − 월세 세액공제\n  - 세액공제: 총급여 7,000만 원 이하 무주택 세대주, 연 월세의 최대 17%\n\n두 옵션의 연간 비용을 비교하고, 손익분기점(어느 금리·월세 수준에서 두 옵션이 같아지는지)도 분석합니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "This comparison uses simplified assumptions about investment returns and interest rates, which fluctuate over time. It does not account for Jeonse fraud risk, deposit return risk, or housing market changes. Your personal financial situation and risk tolerance should guide the final decision.",
      ko: "본 비교는 투자수익률과 대출금리에 대한 단순 가정을 사용하며, 실제로는 시장 상황에 따라 변동됩니다. 전세 사기 위험, 보증금 미반환 리스크, 주택 시장 변동은 반영되지 않습니다. 최종 결정은 개인 재무 상황과 리스크 허용 범위를 고려하여 내리세요."
    }
  },

  "roi-calculator": {
    about: {
      en: "The ROI (Return on Investment) Calculator measures the profitability of an investment by comparing the gain or loss relative to its cost. Enter your initial investment, final value (or revenue), and time period to calculate ROI percentage, annualized return, and total profit or loss.",
      ko: "투자수익률(ROI) 계산기는 투자 원금 대비 수익(또는 손실)의 비율을 계산하여 투자 성과를 평가합니다. 투자금, 최종 가치, 투자 기간을 입력하면 ROI 퍼센트, 연환산 수익률, 순이익을 한눈에 확인할 수 있습니다."
    },
    howItWorks: {
      en: "ROI is calculated using:\n\nBasic ROI = ((Final Value − Initial Investment) / Initial Investment) × 100%\n\nNet Profit = Final Value − Initial Investment − Additional Costs (fees, taxes, etc.)\n\nAnnualized ROI = ((1 + ROI/100)^(1/years) − 1) × 100%. This allows comparison of investments with different holding periods.\n\nFor investments with ongoing cash flows (dividends, rental income):\nTotal Return = (Final Value + Total Cash Flows − Initial Investment) / Initial Investment × 100%\n\nThe calculator also computes the doubling time using the Rule of 72: Years to Double ≈ 72 / Annual Return %.",
      ko: "ROI 계산 공식:\n\n기본 ROI = ((최종 가치 − 투자 원금) / 투자 원금) × 100%\n\n순이익 = 최종 가치 − 투자 원금 − 부대비용(수수료, 세금 등)\n\n연환산 수익률 = ((1 + ROI/100)^(1/투자기간) − 1) × 100%. 투자 기간이 다른 상품 간 비교가 가능합니다.\n\n배당·임대수익 등 현금흐름이 있는 투자:\n총 수익률 = (최종 가치 + 총 현금흐름 − 투자 원금) / 투자 원금 × 100%\n\n원금 2배 소요 기간 (72의 법칙): 약 72 ÷ 연수익률(%)."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "ROI calculations shown here are based on the values you input and assume no additional risk factors. Past returns do not guarantee future results. Investment involves risk of loss. Consider all costs, taxes, and risks before making investment decisions.",
      ko: "ROI 계산은 입력된 값을 기준으로 하며 추가적인 리스크 요인은 반영하지 않습니다. 과거 수익률이 미래 수익을 보장하지 않으며, 투자에는 원금 손실 위험이 있습니다. 투자 결정 전 모든 비용, 세금, 리스크를 종합적으로 고려하세요."
    }
  },

  "currency-converter": {
    about: {
      en: "The Currency Converter provides quick exchange rate calculations between major world currencies and Korean Won (KRW). Enter an amount in one currency to see its equivalent in another, with reference rates updated regularly. Useful for international travelers, online shoppers, and anyone dealing with foreign transactions.",
      ko: "환율 계산기는 주요 통화와 원화(KRW) 간 환전 금액을 빠르게 계산하는 도구입니다. 여행 준비, 해외직구 결제금액 확인, 해외 송금 시 환전 비용을 미리 파악하는 데 활용할 수 있습니다."
    },
    howItWorks: {
      en: "The conversion formula is straightforward:\n\nConverted Amount = Original Amount × Exchange Rate\n\nFor cross-currency conversion (e.g., EUR to JPY): the tool converts through a base currency. Amount in Target = Amount in Source × (Source-to-Base Rate) × (Base-to-Target Rate).\n\nThe calculator displays:\n• Mid-market rate (기준환율)\n• Buy rate (살 때) and Sell rate (팔 때) with typical bank spread\n• Fee-inclusive estimate based on a configurable spread percentage\n\nExchange rates are reference rates and may differ from the rates offered by banks, airports, or money changers due to spreads and fees.",
      ko: "환전 계산 공식:\n\n환전 금액 = 원래 금액 × 환율\n\n교차 환전(예: 유로 → 엔화): 기준 통화를 경유하여 계산합니다. 대상 통화 금액 = 원래 금액 × (원화 환율 A) ÷ (원화 환율 B).\n\n계산기에서 제공하는 정보:\n• 기준환율 (매매기준율)\n• 현찰 살 때 / 팔 때 환율 (은행 스프레드 반영)\n• 환전 수수료 포함 예상 금액\n\n표시되는 환율은 참고용 기준환율이며, 실제 은행·환전소 환율은 스프레드와 수수료로 인해 차이가 있을 수 있습니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Exchange rates shown are reference rates and may not reflect actual transaction rates. Banks and currency exchange services apply their own spreads and fees. Rates fluctuate continuously during market hours. For large transactions, always confirm the rate with your financial institution.",
      ko: "표시되는 환율은 참고용 기준환율이며 실제 거래 환율과 다를 수 있습니다. 은행·환전소마다 스프레드와 수수료가 다르게 적용됩니다. 환율은 시장 개장 중 실시간으로 변동됩니다. 대규모 환전 시 반드시 거래 금융기관에서 적용 환율을 확인하세요."
    }
  },

  "electricity-calculator": {
    about: {
      en: "The Electricity Bill Calculator estimates your monthly electricity cost based on Korea's progressive residential rate structure (KEPCO). Enter your monthly power usage in kWh to see the breakdown of base charges, energy charges, and surcharges including VAT and Electric Power Fund levy.",
      ko: "전기요금 계산기는 한국전력(KEPCO)의 누진제 주택용 전기요금 체계를 기반으로 월간 전기요금을 산출합니다. 사용량(kWh)을 입력하면 기본요금, 전력량요금, 부가가치세, 전력산업기반기금 등 항목별 상세 내역을 확인할 수 있습니다."
    },
    howItWorks: {
      en: "Korean residential electricity (KEPCO) uses a progressive rate system:\n\n• Tier 1 (≤200 kWh): Base ₩910, Energy ₩112.0/kWh\n• Tier 2 (201–400 kWh): Base ₩1,600, Energy ₩206.6/kWh\n• Tier 3 (>400 kWh): Base ₩7,300, Energy ₩299.3/kWh\n\nMonthly Bill Calculation:\n1. Base Charge: determined by usage tier\n2. Energy Charge: tiered rate × usage in each bracket\n3. Climate/Environment Charge: ₩9.0/kWh\n4. Fuel Cost Adjustment: variable per kWh\n5. Subtotal = Base + Energy + Climate + Fuel Adjustment\n6. VAT = Subtotal × 10% (rounded down to ₩10)\n7. Electric Power Fund = Subtotal × 3.7% (rounded down to ₩10)\n8. Total = Subtotal + VAT + Fund",
      ko: "한국전력 주택용 전기요금은 누진제로 계산됩니다:\n\n• 1구간 (200kWh 이하): 기본료 910원, 전력량요금 112.0원/kWh\n• 2구간 (201~400kWh): 기본료 1,600원, 전력량요금 206.6원/kWh\n• 3구간 (400kWh 초과): 기본료 7,300원, 전력량요금 299.3원/kWh\n\n월 전기요금 계산:\n1. 기본요금: 사용량 구간에 따라 결정\n2. 전력량요금: 각 구간별 단가 × 해당 구간 사용량\n3. 기후환경요금: 9.0원/kWh\n4. 연료비조정액: kWh당 변동 단가\n5. 소계 = 기본요금 + 전력량요금 + 기후환경요금 + 연료비조정액\n6. 부가가치세 = 소계 × 10% (10원 미만 절사)\n7. 전력산업기반기금 = 소계 × 3.7% (10원 미만 절사)\n8. 청구금액 = 소계 + 부가세 + 기금"
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "Electricity rates are set by KEPCO and may change. Seasonal rates (summer/winter surcharges), multi-family discounts, welfare discounts, and time-of-use rates are not fully reflected. Check your actual bill or KEPCO's website (kepco.co.kr) for precise rates.",
      ko: "전기요금은 한국전력이 정하며 변경될 수 있습니다. 하계·동계 할증, 대가족·복지 할인, 시간대별 요금제 등은 완전히 반영되지 않을 수 있습니다. 정확한 요금은 고지서 또는 한국전력 홈페이지(kepco.co.kr)에서 확인하세요."
    }
  },

  "discount-calculator": {
    about: {
      en: "The Discount Calculator instantly computes the final price after applying one or more percentage discounts, as well as the total amount you save. Enter the original price and discount percentage to see the sale price. It also supports stacked discounts (e.g., 20% off + additional 10% off) and calculates the effective total discount rate.",
      ko: "할인율 계산기는 정가에서 할인율을 적용한 최종 판매가와 절약 금액을 즉시 계산합니다. 중복 할인(예: 20% 할인 + 추가 10% 할인)도 지원하며, 실질 할인율이 단순 합산이 아닌 복합 계산임을 명확히 보여줍니다."
    },
    howItWorks: {
      en: "Single discount: Sale Price = Original Price × (1 − Discount % / 100). Savings = Original Price − Sale Price.\n\nStacked (multiple) discounts are applied sequentially, not added:\nFinal Price = Original Price × (1 − D1/100) × (1 − D2/100) × ... × (1 − Dn/100)\n\nEffective Total Discount = (1 − Final Price / Original Price) × 100%\n\nExample: 20% + 10% stacked = 1 − (0.8 × 0.9) = 28% effective discount, NOT 30%.\n\nThe calculator can also reverse-calculate: given a sale price and original price, it determines the discount percentage applied.",
      ko: "단일 할인: 판매가 = 정가 × (1 − 할인율 / 100). 절약 금액 = 정가 − 판매가.\n\n중복 할인은 순차 적용되며, 단순 합산이 아닙니다:\n최종가 = 정가 × (1 − D1/100) × (1 − D2/100) × ... × (1 − Dn/100)\n\n실질 할인율 = (1 − 최종가 / 정가) × 100%\n\n예시: 20% + 10% 중복 = 1 − (0.8 × 0.9) = 28% 실질 할인 (30%가 아님).\n\n역계산 기능: 판매가와 정가를 입력하면 적용된 할인율을 역산할 수도 있습니다."
    },
    howItWorksTitle: { en: "How It's Calculated", ko: "계산 원리" },
    disclaimer: {
      en: "This calculator computes pure percentage discounts. Actual retail prices may include additional taxes, shipping costs, or membership-specific pricing. Always verify the final checkout price when shopping.",
      ko: "본 계산기는 순수 할인율 계산을 제공합니다. 실제 구매가에는 배송비, 부가세, 멤버십 할인 등이 추가로 적용될 수 있습니다. 결제 시 최종 금액을 반드시 확인하세요."
    }
  }
};
