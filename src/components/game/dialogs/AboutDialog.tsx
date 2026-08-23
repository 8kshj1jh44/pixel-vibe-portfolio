import { profile } from "@/content/portfolio";
import { PixelDialog } from "../PixelDialog";

export function AboutDialog({ onClose }: { onClose: () => void }) {
  return (
    <PixelDialog title="ABOUT THE PLAYER" onClose={onClose}>
      <h3 className="font-display text-[0.6rem] text-accent">{profile.name}</h3>
      <p className="mt-2 text-cyan-crt">{profile.title}</p>
      <p className="text-cyan-crt">
        {profile.phone} · {profile.email}
      </p>
      <p className="mt-3">{profile.summary}</p>
    </PixelDialog>
  );
}
