/**
 * Unsplash hero images for each blog post — 3 per post for fallback chain.
 * [primary, backup1, backup2] — if primary fails, tries backup1, then backup2.
 * All images are free to use under the Unsplash license.
 */
export const blogHeroImages: Record<string, string[]> = {
  // ── Lifestyle / Date & Time ──
  "dday-guide": [
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe",
    "https://images.unsplash.com/photo-1435527173128-983b87201f4d",
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b",
  ],
  "gpa-guide": [
    "https://images.unsplash.com/photo-1523050854058-8df90110c476",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45",
  ],
  "sleep-guide": [
    "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55",
    "https://images.unsplash.com/photo-1515894203077-9cd36032142f",
    "https://images.unsplash.com/photo-1531353826977-0941b4779a1c",
  ],
  "alcohol-guide": [
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187",
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87",
  ],
  "date-guide": [
    "https://images.unsplash.com/photo-1506784365847-bbad939e9335",
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b",
    "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a",
  ],

  // ── Text Tools ──
  "how-to-count-words-in-essay": [
    "https://images.unsplash.com/photo-1455390582262-044cdead277a",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8",
  ],
  "text-case-conversion-guide": [
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8",
    "https://images.unsplash.com/photo-1519682577862-22b62b24e493",
  ],
  "copy-paste-symbols-special-characters": [
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    "https://images.unsplash.com/photo-1541462608143-67571c6738dd",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
  ],
  "text-diff-guide": [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd",
  ],

  // ── Developer Tools ──
  "json-formatting-best-practices": [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd",
  ],
  "understanding-base64-encoding": [
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a",
  ],
  "hex-to-rgb-color-converter-guide": [
    "https://images.unsplash.com/photo-1525909002-1b05e0c869d8",
    "https://images.unsplash.com/photo-1502691876148-a84978e59af8",
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab",
  ],
  "markdown-guide": [
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713",
    "https://images.unsplash.com/photo-1515879218367-8466d910auj7",
    "https://images.unsplash.com/photo-1587620962725-abab7fe55159",
  ],
  "lorem-ipsum-history-and-usage": [
    "https://images.unsplash.com/photo-1473186505569-9c61870c11f9",
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
  ],

  // ── Generators ──
  "how-to-create-strong-passwords": [
    "https://images.unsplash.com/photo-1614064641938-3cb20b4cba1a",
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb",
    "https://images.unsplash.com/photo-1563986768609-322da13575f2",
  ],
  "how-to-create-qr-code-free": [
    "https://images.unsplash.com/photo-1595079676339-1534801ad6cf",
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
  ],

  // ── Finance: Calculators ──
  "compound-interest-calculator-guide": [
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
  ],
  "mortgage-calculator-guide": [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf",
  ],
  "retirement-savings-calculator-guide": [
    "https://images.unsplash.com/photo-1473186578172-c141e6798cf4",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
  ],
  "emergency-fund-calculator-guide": [
    "https://images.unsplash.com/photo-1553729459-afe8f2e2ed65",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e",
  ],
  "freelancer-tax-calculator-guide": [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
  ],
  "salary-calculator-guide": [
    "https://images.unsplash.com/photo-1554224154-26032ffc0d07",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
  ],
  "loan-calculator-guide": [
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3",
  ],
  "unit-converter-guide": [
    "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758",
    "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d",
  ],
  "percentage-calculator-guide": [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
  ],

  // ── Finance: Knowledge ──
  "simple-vs-compound-interest": [
    "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf",
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
  ],
  "how-to-calculate-net-worth": [
    "https://images.unsplash.com/photo-1518458028785-8f86f55ae17b",
    "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
  ],
  "emergency-fund-how-much-to-save": [
    "https://images.unsplash.com/photo-1553729459-afe8f2e2ed65",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
  ],
  "pay-off-mortgage-faster": [
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf",
  ],

  // ── Health & Lifestyle ──
  "bmi-calculator-guide": [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
  ],
  "age-calculator-guide": [
    "https://images.unsplash.com/photo-1504439468489-c8920d796a29",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176",
    "https://images.unsplash.com/photo-1464349153159-4e725ab89080",
  ],
  "calorie-calculator-guide": [
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
  ],
  "bmr-vs-bmi-difference": [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
  ],
  "calories-to-lose-weight": [
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
  ],
  "korean-age-vs-international-age": [
    "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b",
    "https://images.unsplash.com/photo-1504439468489-c8920d796a29",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205",
  ],
  "body-fat-guide": [
    "https://images.unsplash.com/photo-1538805060514-97d9cc17730c",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
  ],

  // ── Korean Finance: Salary & Tax ──
  "salary-guide": [
    "https://images.unsplash.com/photo-1554224154-26032ffc0d07",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
  ],
  "vat-guide": [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
  ],
  "severance-guide": [
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    "https://images.unsplash.com/photo-1497215842964-222b430dc094",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
  ],
  "rent-conversion-guide": [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf",
  ],
  "area-guide": [
    "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
  ],
  "wage-guide": [
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
    "https://images.unsplash.com/photo-1554224154-26032ffc0d07",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
  ],
  "electricity-guide": [
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e",
    "https://images.unsplash.com/photo-1558449028-b53a39d100fc",
    "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9",
  ],
  "weekly-pay-guide": [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
  ],
  "annual-leave-guide": [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
    "https://images.unsplash.com/photo-1473186578172-c141e6798cf4",
  ],
  "unemployment-guide": [
    "https://images.unsplash.com/photo-1521791055366-0d553872125f",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
  ],
  "acquisition-tax-guide": [
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
  ],
  "income-tax-guide": [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
  ],
  "car-tax-guide": [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
    "https://images.unsplash.com/photo-1485291571150-772bcfc10da5",
  ],
  "capital-gains-guide": [
    "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f",
  ],
  "loan-comparison-guide": [
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
  ],
  "inheritance-tax-guide": [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
    "https://images.unsplash.com/photo-1589578527966-fdac0f44566c",
  ],
  "dsr-guide": [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
  ],
  "accident-settlement-guide": [
    "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae",
    "https://images.unsplash.com/photo-1589578527966-fdac0f44566c",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
  ],
  "national-pension-guide": [
    "https://images.unsplash.com/photo-1531482615713-2afd69097998",
    "https://images.unsplash.com/photo-1473186578172-c141e6798cf4",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
  ],

  // ── Korean Finance: Special Guides ──
  "policy-fund-guide": [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
  ],
  "freelancer-tax-guide": [
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
  ],
  "small-business-policy-fund-2026": [
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
  ],
  "mortgage-refinance-guide-2026": [
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf",
  ],
  "personal-rehabilitation-guide": [
    "https://images.unsplash.com/photo-1589578527966-fdac0f44566c",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
  ],
  "car-insurance-comparison-2026": [
    "https://images.unsplash.com/photo-1449965408869-ebd13bc9e5a8",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
    "https://images.unsplash.com/photo-1485291571150-772bcfc10da5",
  ],
  "credit-score-improvement-guide": [
    "https://images.unsplash.com/photo-1556742393-d75f468bfcb0",
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
  ],
  "roi-calculator-investment-guide": [
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
  ],

  // ── Image & File Tools ──
  "pdf-to-word-guide": [
    "https://images.unsplash.com/photo-1568667256549-094345857637",
    "https://images.unsplash.com/photo-1586953208448-b95a79798f07",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
  ],
  "pdf-compress-guide": [
    "https://images.unsplash.com/photo-1586953208448-b95a79798f07",
    "https://images.unsplash.com/photo-1568667256549-094345857637",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
  ],
  "excel-merge-guide": [
    "https://images.unsplash.com/photo-1543286386-713bdd548da4",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
  ],
  "image-upscale-guide": [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd",
    "https://images.unsplash.com/photo-1552168324-d612d77725e3",
  ],
  "image-crop-guide": [
    "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    "https://images.unsplash.com/photo-1552168324-d612d77725e3",
  ],
  "image-kb-guide": [
    "https://images.unsplash.com/photo-1607798748738-b15c40d33d57",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd",
  ],
  "watermark-guide": [
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    "https://images.unsplash.com/photo-1561070791-2526d30994b5",
  ],
  "how-to-make-gif-from-images": [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
    "https://images.unsplash.com/photo-1561070791-2526d30994b5",
    "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd",
  ],
  "pdf-to-excel-conversion-guide": [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    "https://images.unsplash.com/photo-1543286386-713bdd548da4",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
  ],
  "how-to-rotate-images-online": [
    "https://images.unsplash.com/photo-1552168324-d612d77725e3",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd",
  ],
  "excel-to-pdf-conversion-guide": [
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
    "https://images.unsplash.com/photo-1568667256549-094345857637",
    "https://images.unsplash.com/photo-1586953208448-b95a79798f07",
  ],
  "image-to-vector-svg-complete-guide": [
    "https://images.unsplash.com/photo-1561070791-2526d30994b5",
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
  ],

  // ── Productivity & Time ──
  "pomodoro-guide": [
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b",
  ],
  "world-clock-guide": [
    "https://images.unsplash.com/photo-1524678714210-9917a6c619c2",
    "https://images.unsplash.com/photo-1501139083538-0139583c060f",
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe",
  ],
  "world-time-converter-guide": [
    "https://images.unsplash.com/photo-1501139083538-0139583c060f",
    "https://images.unsplash.com/photo-1524678714210-9917a6c619c2",
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe",
  ],
  "ladder-game-online-guide": [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176",
  ],
  "schedule-finder-meeting-time-guide": [
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b",
  ],
  "currency-converter-exchange-rate-guide": [
    "https://images.unsplash.com/photo-1580519542036-c47de6196ba5",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
  ],
  "typing-speed-test-guide": [
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    "https://images.unsplash.com/photo-1541462608143-67571c6738dd",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
  ],
  "json-formatter-guide": [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    "https://images.unsplash.com/photo-1516116216624-53e697fedbea",
  ],
  "base64-encoding-guide": [
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    "https://images.unsplash.com/photo-1550439062-609e1531270e",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd",
  ],
  "jeonse-vs-wolse-guide": [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
    "https://images.unsplash.com/photo-1582407947092-50c0d0a0b5d7",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
  ],
  "color-picker-guide": [
    "https://images.unsplash.com/photo-1525909002-1b05e0c869d8",
    "https://images.unsplash.com/photo-1502691876148-a84978e59af8",
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab",
  ],
  "capital-gains-tax-guide": [
    "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf",
  ],
  "word-counter-guide": [
    "https://images.unsplash.com/photo-1455390582262-044cdead277a",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8",
  ],
  "year-end-tax-guide": [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
  ],
  "uuid-generator-guide": [
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a",
  ],
  "regex-tester-guide": [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    "https://images.unsplash.com/photo-1516116216624-53e697fedbea",
  ],
  "hash-generator-guide": [
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
  ],
  "url-encoder-guide": [
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8",
    "https://images.unsplash.com/photo-1516116216624-53e697fedbea",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
  ],
  "css-gradient-guide": [
    "https://images.unsplash.com/photo-1557683316-973673baf926",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071",
  ],
  "special-characters-for-sns": [
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7",
    "https://images.unsplash.com/photo-1562577309-4932fdd64cd1",
    "https://images.unsplash.com/photo-1563986768609-322da13575f2",
  ],
  "special-characters-keyboard-shortcut": [
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    "https://images.unsplash.com/photo-1541462608143-67571c6738dd",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
  ],
};
