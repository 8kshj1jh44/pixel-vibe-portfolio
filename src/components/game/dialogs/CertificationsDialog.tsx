import { certifications } from "@/content/portfolio";
import { PixelDialog } from "../PixelDialog";

export function CertificationsDialog({ onClose }: { onClose: () => void }) {
  return (
    <PixelDialog title="CERTIFICATION VAULT" onClose={onClose}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {certifications.map((cert) => (
          <li key={cert.name} className="border-4 border-border bg-secondary px-3 py-3">
            <strong className="text-accent">{cert.name}</strong>
            {cert.issuer && <span className="block text-cyan-crt">{cert.issuer}</span>}
            <span className="block text-muted-foreground">{cert.date}</span>
          </li>
        ))}
      </ul>
    </PixelDialog>
  );
}
