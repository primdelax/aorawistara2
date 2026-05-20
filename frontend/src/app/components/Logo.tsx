import logoAora from '../../images/LOGO AORA POLOS.png';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={logoAora}
        alt="Aora Logo"
        className="w-8 h-8 object-contain"
      />
      <span
        className={`tracking-tight ${light ? "text-white" : "text-[#0A1F44]"}`}
        style={{ fontWeight: 900, fontSize: "26px", letterSpacing: "-0.02em" }}
      >
        Aora
      </span>
    </div>
  );
}
