import { technicalTools } from "@/content/portfolio";
import { PixelDialog } from "../PixelDialog";

export function ToolsDialog({ onClose }: { onClose: () => void }) {
  return (
    <PixelDialog title="TOOL REEF" onClose={onClose}>
      <ul className="flex flex-wrap gap-2">
        {technicalTools.map((tool) => (
          <li key={tool} className="border-4 border-border bg-secondary px-3 py-2">
            <span className="text-cyan-crt">◆</span> {tool}
          </li>
        ))}
      </ul>
    </PixelDialog>
  );
}
