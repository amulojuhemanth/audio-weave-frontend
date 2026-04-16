"use client";

interface AudioLengthInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export default function AudioLengthInput({
  value,
  onChange,
  disabled,
}: AudioLengthInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="sfx-audio-length"
        className="text-sm font-medium text-zinc-300"
      >
        Audio Length{" "}
        <span className="text-zinc-500 font-normal">(seconds, optional)</span>
      </label>
      <div className="relative">
        <input
          id="sfx-audio-length"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Auto"
          min={1}
          max={30}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
          sec
        </div>
      </div>
    </div>
  );
}
