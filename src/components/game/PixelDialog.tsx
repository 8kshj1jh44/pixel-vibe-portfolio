import type { ReactNode } from "react";

export function PixelDialog({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-screen/80 p-3 sm:p-6">
      <div className="pixel-box w-full max-w-2xl bg-card">
        <div className="flex items-center justify-between border-b-4 border-border bg-secondary px-3 py-2">
          <h2 className="font-display text-[0.6rem] text-accent sm:text-[0.7rem]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="font-display text-[0.6rem] text-foreground hover:text-primary"
          >
            X
          </button>
        </div>
        <div className="max-h-[58vh] overflow-y-auto px-4 py-4 text-lg leading-relaxed sm:px-6">
          {children}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t-4 border-border px-4 py-2">
          <span className="text-base text-muted-foreground">
            <span className="blink">▶</span> PRESS ESC TO RESUME
          </span>
          {footer}
        </div>
      </div>
    </div>
  );
}
