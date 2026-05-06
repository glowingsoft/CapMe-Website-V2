export function extractHashtags(text) {
  if (!text) return [];
  const matches = String(text).match(/#[\p{L}\p{N}_]+/gu);
  return matches || [];
}

export function getHashtagQuery(text) {
  if (!text) return null;
  const value = String(text);
  const match = value.match(/(?:^|\s)#([\p{L}\p{N}_]{0,32})$/u);
  if (!match) return null;
  return { query: match[1] ?? '', startIndex: value.lastIndexOf('#') };
}

