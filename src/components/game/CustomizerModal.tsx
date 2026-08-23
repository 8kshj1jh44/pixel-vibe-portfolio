import type {
  Appearance,
  CharacterAccessory,
  CharacterPalette,
  PetSpecies,
} from "@/components/game/engine";

export function CustomizerModal({
  appearance,
  onChange,
  onPlay,
  onBack,
}: {
  appearance: Appearance;
  onChange: (value: Appearance) => void;
  onPlay: () => void;
  onBack: () => void;
}) {
  const palettes: CharacterPalette[] = ["coral", "aqua", "lime"];
  const accessories: CharacterAccessory[] = ["mask", "cap", "headset"];
  const pets: PetSpecies[] = ["fish", "turtle", "octopus"];
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-screen/95 p-3 sm:absolute sm:bg-screen/90">
      <div className="pixel-box w-full max-w-2xl bg-card p-4 sm:p-6">
        <h2 className="font-display text-xs text-accent">CUSTOMIZE YOUR CREW</h2>
        <CustomizerRow
          label="SUIT COLOR"
          options={palettes}
          value={appearance.palette}
          onPick={(palette) => onChange({ ...appearance, palette })}
        />
        <CustomizerRow
          label="ACCESSORY"
          options={accessories}
          value={appearance.accessory}
          onPick={(accessory) => onChange({ ...appearance, accessory })}
        />
        <CustomizerRow
          label="PET"
          options={pets}
          value={appearance.pet}
          onPick={(pet) => onChange({ ...appearance, pet })}
        />
        <CustomizerRow
          label="PET COLOR"
          options={palettes}
          value={appearance.petColor}
          onPick={(petColor) => onChange({ ...appearance, petColor })}
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="pixel-btn bg-primary text-primary-foreground"
            onClick={onPlay}
          >
            PLAY
          </button>
          <button type="button" className="pixel-btn bg-secondary text-foreground" onClick={onBack}>
            BACK
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomizerRow<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: T[];
  value: T;
  onPick: (option: T) => void;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="font-display text-[0.5rem] text-cyan-crt">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => onPick(option)}
            className={`pixel-btn ${value === option ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
