import { useRef, useCallback } from 'react';

/**
 * useLongPress
 *
 * Detects a long-press (sustained touch without movement) and fires a callback.
 * Cancels if the touch moves — prevents false positives during scroll.
 *
 * @param {Function} callback  - Called when the long press threshold is reached.
 * @param {number}   delay     - Milliseconds to hold before firing (default 500).
 * @returns {{ onTouchStart, onTouchEnd, onTouchMove }}
 */
export const useLongPress = (callback, delay = 500) => {
  const timerRef  = useRef(null);
  const activeRef = useRef(false);

  const start = useCallback(
    (e) => {
      // Prevent the browser's built-in long-press context menu.
      e.preventDefault();
      activeRef.current = true;
      timerRef.current = setTimeout(() => {
        if (activeRef.current) {
          callback(e);
        }
      }, delay);
    },
    [callback, delay]
  );

  const cancel = useCallback(() => {
    activeRef.current = false;
    clearTimeout(timerRef.current);
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd:   cancel,
    onTouchMove:  cancel,
  };
};
