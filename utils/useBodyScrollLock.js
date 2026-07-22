import { useEffect } from "react";

// Robust cross-browser scroll lock for modals. Plain `overflow: hidden` on
// body is NOT reliably respected by iOS Safari for touch-driven scrolling --
// that's exactly what let background content (e.g. listing cards) visually
// scroll on top of a fixed-position, higher-z-index modal despite it having
// no business rendering above it. Pinning body to position: fixed removes it
// from the scrollable flow entirely instead of just hinting the browser not
// to scroll it, which iOS ignores under touch scroll/momentum.
// `enabled` defaults to true for callers that only ever mount this component
// while it's meant to be shown (e.g. RequestWizardModal, unmounted via the
// caller's own `{open && <Modal/>}`). Pass the caller's own `open` state
// explicitly for components that stay mounted and toggle an internal
// section instead (ConfirmDialog, MediaGallery's lightbox) -- otherwise the
// lock activates on first mount and never releases.
export function useBodyScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [enabled]);
}
