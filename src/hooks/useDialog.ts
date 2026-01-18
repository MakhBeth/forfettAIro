import { useEffect, useRef, useCallback } from 'react';

export function useDialog(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      // Save trigger element for focus restoration
      triggerRef.current = document.activeElement;
      dialog.showModal();

      // Focus first focusable element
      const focusable = dialog.querySelector<HTMLElement>(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) {
        focusable.focus();
      }
    } else if (!isOpen && dialog.open) {
      dialog.close();

      // Restore focus to trigger
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Handle backdrop click - only close if click is directly on dialog (backdrop area)
  const handleClick = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Get click position relative to dialog
    const rect = dialog.getBoundingClientRect();
    const clickedInDialog = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );

    // Only close if clicked outside the dialog content (on backdrop)
    if (!clickedInDialog) {
      onClose();
    }
  }, [onClose]);

  return { dialogRef, handleClick };
}
