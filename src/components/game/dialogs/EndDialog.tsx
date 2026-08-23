import { profile, skills } from "@/content/portfolio";
import { PixelDialog } from "../PixelDialog";

export function EndDialog({
  collected,
  onContact,
  onClose,
}: {
  collected: string[];
  onContact: () => void;
  onClose: () => void;
}) {
  return (
    <PixelDialog
      title="STAGE CLEAR"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="pixel-btn bg-primary text-primary-foreground"
          onClick={onContact}
        >
          HIRE / CONTACT ME
        </button>
      }
    >
      <h3 className="text-glow font-display text-base text-accent">THANK YOU</h3>
      <p className="mt-3">
        You reached the flag with {collected.length} of {skills.length} skills collected. Thanks for
        playing through my portfolio — let&apos;s build something together.
      </p>
      <p className="mt-2 text-cyan-crt">
        {profile.phone} · {profile.email}
      </p>
    </PixelDialog>
  );
}
