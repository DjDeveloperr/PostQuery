export function unsketchify(res: string) {
  if (!res.startsWith('"') && !res.endsWith('"')) res = '"' + res + '"';
  res = '"' + res.substr(1, res.length - 2).replaceAll('"', '""') + '"';
  return res;
}
