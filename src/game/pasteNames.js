import { parseNames } from './engine.js';

export function namesFromPaste(value) {
  const text = String(value || '').normalize('NFC').replace(/\r\n?/g, '\n').trim();
  if (!text) return [];
  // Bảng nhiều hàng từ Excel vẫn dùng bộ ghép cột họ đệm + tên.
  if (text.includes('\t') && text.includes('\n')) return [...new Set(parseNames(text))];
  const numbered = [...text.matchAll(/(?:^|\s)\d+[.)]\s+/g)];
  const normalized = numbered.length > 1
    ? text.replace(/(?:^|\s)\d+[.)]\s+/g, '\n')
    : text;
  return [...new Set(normalized.split(/[\n,;|\t]+/)
    .map(name => name.trim().replace(/^(?:\d+[.)]\s+|[•●▪]\s*)/, '').replace(/\s+/g, ' '))
    .filter(Boolean))];
}

export function insertPastedNames(current, start, end, pasted) {
  const names = namesFromPaste(pasted);
  if (!names.length) return { text: current, caret: start };
  const before = current.slice(0, start), after = current.slice(end);
  const inserted = (before && !before.endsWith('\n') ? '\n' : '') + names.join('\n')
    + (after && !after.startsWith('\n') ? '\n' : '');
  return { text: before + inserted + after, caret: before.length + inserted.length };
}
