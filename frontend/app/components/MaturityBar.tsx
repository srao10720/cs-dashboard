"use client";

const STAGES = ["Awareness", "Adoption", "Value Realization", "Optimization", "Transformation"];

interface Props {
  stage: string;
  compact?: boolean;
}

export default function MaturityBar({ stage, compact = false }: Props) {
  const idx = STAGES.indexOf(stage);

  if (compact) {
    return (
      <span className="text-xs text-gray-500 font-medium">{stage}</span>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Maturity</span>
        <span className="font-medium text-gray-600">{stage}</span>
      </div>
      <div className="flex gap-0.5">
        {STAGES.map((s, i) => (
          <div
            key={s}
            title={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= idx ? "bg-violet-500" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
