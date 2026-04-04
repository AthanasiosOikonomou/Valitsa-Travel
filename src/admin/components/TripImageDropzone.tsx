import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, ImageIcon } from "lucide-react";
import { uploadTripImage } from "@/lib/adminApi";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (url: string) => void;
  className?: string;
};

export function TripImageDropzone({ value, onChange, className }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const f = acceptedFiles[0];
      if (!f) return;
      setErr(null);
      setBusy(true);
      try {
        const { url } = await uploadTripImage(f);
        onChange(url);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"] },
    maxFiles: 1,
    disabled: busy,
  });

  return (
    <div className={cn("space-y-2", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/80 bg-muted/30 px-6 py-10 transition-colors hover:bg-muted/50",
          isDragActive && "border-primary bg-primary/5",
          busy && "pointer-events-none opacity-70",
        )}
      >
        <input {...getInputProps()} />
        {busy ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        )}
        <p className="text-center text-sm text-muted-foreground">
          Drop an image here, or click to browse
        </p>
      </div>
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
      {value ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <img src={value} alt="" className="max-h-48 w-full object-cover" />
        </div>
      ) : null}
    </div>
  );
}
