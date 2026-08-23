import { ContactTerminal } from "../ContactTerminal";
import { PixelDialog } from "../PixelDialog";

export function ContactDialog({ onClose }: { onClose: () => void }) {
  return (
    <PixelDialog title="CONTACT TERMINAL" onClose={onClose}>
      <ContactTerminal />
    </PixelDialog>
  );
}
