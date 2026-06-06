import { useCallback, useState } from 'react';

/**
 * Copy-to-clipboard with a transient "copied" flag.
 *
 * Centralises the copy + reset-after-timeout pattern that several pages
 * previously duplicated inline.
 *
 * @param {number} resetMs  How long the `copied` flag stays true (default 1500ms).
 * @returns {{ copied: boolean, copy: (text: string) => void }}
 */
export function useClipboard(resetMs = 1500) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    (text) => {
      if (text == null) return;
      navigator.clipboard.writeText(String(text)).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), resetMs);
      });
    },
    [resetMs],
  );

  return { copied, copy };
}
