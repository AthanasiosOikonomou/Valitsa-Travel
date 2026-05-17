import { useCallback, useState } from "react";

export type UseUnsavedDialogCloseOptions = {
  isDirty: boolean;
  onClose: () => void;
  /** Called when user chooses leave without saving; defaults to `onClose`. */
  onDiscard?: () => void;
  /** Persist changes then close (caller should close on success). */
  onSaveAndClose?: () => void | Promise<void>;
};

export function useUnsavedDialogClose({
  isDirty,
  onClose,
  onDiscard,
  onSaveAndClose,
}: UseUnsavedDialogCloseOptions) {
  const [unsavedOpen, setUnsavedOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const tryClose = useCallback(() => {
    if (!isDirty) {
      onClose();
      return;
    }
    setUnsavedOpen(true);
  }, [isDirty, onClose]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) return;
      tryClose();
    },
    [tryClose],
  );

  const discardAndClose = useCallback(() => {
    setUnsavedOpen(false);
    (onDiscard ?? onClose)();
  }, [onClose, onDiscard]);

  const saveAndClose = useCallback(async () => {
    if (!onSaveAndClose) {
      setUnsavedOpen(false);
      onClose();
      return;
    }
    setIsSaving(true);
    try {
      await onSaveAndClose();
      setUnsavedOpen(false);
    } catch {
      // Keep alert open; caller shows toast / validation errors.
    } finally {
      setIsSaving(false);
    }
  }, [onClose, onSaveAndClose]);

  return {
    tryClose,
    handleOpenChange,
    unsavedAlert: {
      open: unsavedOpen,
      onOpenChange: setUnsavedOpen,
      onDiscard: discardAndClose,
      onSaveAndClose: saveAndClose,
      isSaving,
    },
  };
}
