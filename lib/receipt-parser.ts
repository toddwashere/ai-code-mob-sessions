export type ParsedReceipt = {
  amount?: number;
  date?: string;
  description?: string;
};

/**
 * Parse OCR text from a receipt to extract amount, date, and merchant/description.
 * Returns partial results - only includes fields that were successfully parsed.
 */
export function parseReceiptText(text: string): ParsedReceipt {
  const result: ParsedReceipt = {};
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Amount: look for TOTAL, Amount, $X.XX - prefer last match (final total)
  const amountPatterns = [
    /(?:total|amount|balance\s+due|grand\s+total)[:\s]*\$?\s*([\d,]+\.\d{2})/gi,
    /\$\s*([\d,]+\.\d{2})/g,
    /\b([\d,]+\.\d{2})\b/g,
  ];
  const amountMatches: string[] = [];
  for (const pattern of amountPatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const m of matches) {
      amountMatches.push(m[1]!.replace(/,/g, ""));
    }
  }
  if (amountMatches.length) {
    const lastAmount = parseFloat(amountMatches[amountMatches.length - 1]!);
    if (!isNaN(lastAmount) && lastAmount > 0 && lastAmount < 1_000_000) {
      result.amount = lastAmount;
    }
  }

  // Date: MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD, etc.
  const datePatterns = [
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
    /(\d{1,2})-(\d{1,2})-(\d{2,4})/,
    /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      let year: number;
      let month: string;
      let day: string;
      if (pattern.source.includes("\\d{4}") && match[1]!.length === 4) {
        // YYYY-MM-DD
        year = parseInt(match[1]!, 10);
        month = match[2]!.padStart(2, "0");
        day = match[3]!.padStart(2, "0");
      } else {
        // MM/DD/YYYY or DD-MM-YYYY
        const a = parseInt(match[1]!, 10);
        const b = parseInt(match[2]!, 10);
        const cStr = match[3]!;
        const c = parseInt(cStr, 10);
        year = cStr.length <= 2 ? (c >= 50 ? 1900 + c : 2000 + c) : c;
        if (a <= 12 && b <= 31) {
          month = String(a).padStart(2, "0");
          day = String(b).padStart(2, "0");
        } else {
          month = String(b).padStart(2, "0");
          day = String(a).padStart(2, "0");
        }
      }
      if (year >= 1990 && year <= 2030) {
        result.date = `${year}-${month}-${day}`;
        break;
      }
    }
  }

  // Description: first non-empty line (often merchant name) or "Receipt"
  const nonNoiseLines = lines.filter(
    (l) =>
      l.length > 2 &&
      !/^\d+$/.test(l) &&
      !/^[\d.,$]+$/.test(l) &&
      !/^(total|subtotal|tax|amount|date|receipt|thank|you)/i.test(l),
  );
  if (nonNoiseLines.length) {
    const first = nonNoiseLines[0]!;
    result.description = first.slice(0, 80).trim();
  } else {
    result.description = "Receipt";
  }

  return result;
}
