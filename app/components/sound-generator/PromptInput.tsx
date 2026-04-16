"use client";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export default function PromptInput({
  value,
  onChange,
  disabled,
}: PromptInputProps) {
  const maxLength = 500;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="sfx-prompt"
          className="text-sm font-medium text-zinc-300"
        >
          Sound Description
        </label>
        <span
          className={`text-xs tabular-nums ${
            value.length > maxLength * 0.9
              ? "text-amber-400"
              : "text-zinc-500"
          }`}
        >
          {value.length}/{maxLength}
        </span>
      </div>
      <textarea
        id="sfx-prompt"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        disabled={disabled}
        placeholder="Describe the sound effect you want to create... e.g., &quot;Futuristic laser beam with echo tail&quot;"
        rows={4}
        className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        autoFocus
      />
    </div>
  );
}
