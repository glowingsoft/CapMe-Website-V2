/**
 * Scrolls a scrollable container to its bottom sentinel element.
 * Uses scrollIntoView on the sentinel when available so the browser
 * accounts for async reflows (images, link previews, fonts).
 * Falls back to scrollTop = scrollHeight for environments that don't
 * support scrollIntoView.
 *
 * @param {React.RefObject} containerRef - ref on the scrollable container
 * @param {React.RefObject} endRef       - ref on the sentinel <div> at the end of the list
 * @param {'auto'|'smooth'} behavior     - scroll behavior (default 'auto' = instant)
 */
export function scrollToBottom(containerRef, endRef, behavior = 'auto') {
    const container = containerRef?.current;
    if (!container) return;
    const end = endRef?.current;
    if (end?.scrollIntoView) {
        end.scrollIntoView({ behavior, block: 'end' });
    } else {
        container.scrollTop = container.scrollHeight;
    }
}
