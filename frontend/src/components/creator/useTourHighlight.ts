'use client';

import { useEffect } from 'react';

/** Wait for route/panel content; remove old targets before highlighting the new one. */
export function useTourHighlight(selector: string | null, className = 'creator-tour-target') {
  useEffect(() => {
    if (!selector) return;
    let target: HTMLElement | null = null;
    let revealed = false;
    let frame = 0;
    function update() {
      const candidate = document.querySelector<HTMLElement>(selector!);
      const next = candidate?.getClientRects().length ? candidate : null;
      if (target !== next) {
        target?.classList.remove(className);
        target = next;
      }
      if (!target) return;
      if (!target.classList.contains(className)) target.classList.add(className);
      if (!revealed) {
        target.scrollIntoView({ block: 'center', behavior: 'instant' });
        revealed = true;
      }
    }
    function schedule() { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'open'] });
    schedule();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); target?.classList.remove(className); };
  }, [selector, className]);
}
