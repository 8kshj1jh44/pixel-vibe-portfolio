export function RulesScreen({
  onCustomize,
  onBack,
}: {
  onCustomize: () => void;
  onBack: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-screen/85 p-4">
      <div className="pixel-box w-full max-w-lg bg-card p-5">
        <h2 className="font-display text-xs text-accent">ARE YOU READY?</h2>
        <ul className="mt-4 space-y-1 text-lg">
          <li>◆ ARROWS or A / D — move</li>
          <li>◆ SPACE, W or ▲ — jump</li>
          <li>◆ E or ENTER — read a signpost, arcade cabinet or terminal</li>
          <li>◆ ESC — close a dialog</li>
          <li>◆ Grab the floating coins to unlock skills</li>
          <li>◆ On mobile, use the on-screen buttons</li>
        </ul>
        <div className="mt-5 flex gap-3">
          <button className="pixel-btn bg-primary text-primary-foreground" onClick={onCustomize}>
            YES
          </button>
          <button className="pixel-btn bg-secondary text-foreground" onClick={onBack}>
            NO
          </button>
        </div>
      </div>
    </div>
  );
}
