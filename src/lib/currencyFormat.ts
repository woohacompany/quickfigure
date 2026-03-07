export type Currency = "KRW" | "USD";

export function getCurrencySymbol(currency: Currency): string {
  return currency === "KRW" ? "₩" : "$";
}

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === "KRW") {
    return "₩" + Math.round(amount).toLocaleString();
  }
  return "$" + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatKRW(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  if (abs === 0) return "0원";

  const eok = Math.floor(abs / 100000000);
  const man = Math.floor((abs % 100000000) / 10000);
  const rest = abs % 10000;

  const parts: string[] = [];
  if (eok > 0) {
    if (eok >= 10000) {
      const jo = Math.floor(eok / 10000);
      const remainEok = eok % 10000;
      parts.push(`${jo}조`);
      if (remainEok > 0) parts.push(`${remainEok.toLocaleString()}억`);
    } else {
      parts.push(`${eok.toLocaleString()}억`);
    }
  }
  if (man > 0) {
    if (man >= 1000) {
      const cheon = Math.floor(man / 1000);
      const remainMan = man % 1000;
      if (cheon > 0) parts.push(`${cheon}천`);
      if (remainMan >= 100) {
        parts.push(`${remainMan}만`);
      } else if (remainMan > 0) {
        parts.push(`${remainMan}만`);
      } else {
        parts[parts.length - 1] += "만";
      }
    } else {
      parts.push(`${man}만`);
    }
  }
  if (rest > 0 && abs >= 10000) {
    // skip small remainder for readability
  } else if (rest > 0) {
    parts.push(`${rest.toLocaleString()}`);
  }

  const prefix = amount < 0 ? "-" : "";
  const text = parts.join(" ");
  return `${prefix}${text} 원`;
}

export function formatUSD(amount: number): string {
  const abs = Math.abs(amount);
  if (abs === 0) return "$0";

  const prefix = amount < 0 ? "-" : "";

  if (abs >= 1000000000) {
    const val = abs / 1000000000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.0$/, "");
    return `${prefix}${formatted} billion`;
  }
  if (abs >= 1000000) {
    const val = abs / 1000000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.0$/, "");
    return `${prefix}${formatted} million`;
  }
  if (abs >= 1000) {
    const val = abs / 1000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.0$/, "");
    return `${prefix}${formatted} thousand`;
  }
  return `${prefix}$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatWithUnit(amount: number, currency: Currency): string {
  const formatted = formatCurrency(amount, currency);
  const unit = currency === "KRW" ? formatKRW(amount) : formatUSD(amount);
  return `${formatted} (${unit})`;
}

export function getPlaceholder(field: "amount" | "rate" | "years", currency: Currency): string {
  if (field === "rate") return "5";
  if (field === "years") return "10";
  if (currency === "KRW") return "10,000,000";
  return "10,000";
}

export function getAmountPlaceholder(currency: Currency, type?: string): string {
  const placeholders: Record<string, Record<Currency, string>> = {
    salary: { KRW: "50,000,000", USD: "60,000" },
    monthly: { KRW: "3,000,000", USD: "3,000" },
    loan: { KRW: "300,000,000", USD: "300,000" },
    emergency: { KRW: "3,000,000", USD: "3,000" },
    investment: { KRW: "10,000,000", USD: "10,000" },
    default: { KRW: "10,000,000", USD: "10,000" },
  };
  return (placeholders[type || "default"] || placeholders.default)[currency];
}
