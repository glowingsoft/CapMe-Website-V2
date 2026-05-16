export const cleanUrl = (s) => {
    if (!s || typeof s !== 'string') return '';
    return s.replace(/^https?:\/\/[^/]+(\/https?:\/\/.+)$/, (_, rest) => rest.slice(1)).trim();
};

function formatDateLabel(isoString) {
    const d = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
    });
}

export function withDateSeparators(messages) {
    const result = [];
    let lastDateStr = null;
    messages.forEach((msg) => {
        if (!msg.createdAt) { result.push(msg); return; }
        const dateStr = new Date(msg.createdAt).toDateString();
        if (dateStr !== lastDateStr) {
            lastDateStr = dateStr;
            result.push({ type: 'date', id: `date-${dateStr}`, label: formatDateLabel(msg.createdAt) });
        }
        result.push(msg);
    });
    return result;
}
