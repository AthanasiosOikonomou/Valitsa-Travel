import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type UnsavedCloseAlertProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSaveAndClose: () => void | Promise<void>;
  isSaving?: boolean;
  overlayClassName?: string;
  className?: string;
};

export function UnsavedCloseAlert({
  open,
  onOpenChange,
  onDiscard,
  onSaveAndClose,
  isSaving = false,
  overlayClassName = "z-[120]",
  className,
}: UnsavedCloseAlertProps) {
  const { t } = useLanguage();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        overlayClassName={overlayClassName}
        className={cn("z-[121] max-w-2xl min-w-0", className)}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="break-words pr-1">
            {t("admin.unsavedCloseTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="break-words text-pretty">
            {t("admin.unsavedCloseDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0 [&>*]:h-auto [&>*]:min-h-10 [&>*]:w-full [&>*]:whitespace-normal [&>*]:px-3 [&>*]:py-2 [&>*]:text-left">
          <AlertDialogCancel disabled={isSaving}>
            {t("admin.unsavedCloseKeepEditing")}
          </AlertDialogCancel>
          <Button type="button" variant="outline" disabled={isSaving} onClick={onDiscard}>
            {t("admin.unsavedCloseDiscard")}
          </Button>
          <AlertDialogAction disabled={isSaving} onClick={() => void onSaveAndClose()}>
            {isSaving ? t("admin.saving") : t("admin.unsavedCloseSaveAndClose")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
