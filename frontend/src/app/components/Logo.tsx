import { Star } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Star
          className="w-8 h-8 text-[#E63946]"
          fill="#E63946"
          strokeWidth={1.5}
        />
      </div>
      <span
        className={`tracking-tight ${light ? "text-white" : "text-[#0A1F44]"}`}
        style={{ fontWeight: 900, fontSize: "26px", letterSpacing: "-0.02em" }}
      >
        Aora
      </span>
    </div>
  );
}
