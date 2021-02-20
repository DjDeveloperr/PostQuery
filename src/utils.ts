/** Wraps the string in given quotes for SQL Query */
export function unsketchify(res: string, quote: '"' | "'" = '"') {
  if (!res.startsWith(quote) && !res.endsWith(quote)) res = quote + res + quote;
  res =
    quote +
    res.substr(1, res.length - 2).replaceAll(quote, quote.repeat(2)) +
    quote;
  return res;
}
