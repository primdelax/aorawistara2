import logoAora from '../../images/LOGO AORA POLOS.png';

export function Logo({ light = false, className = "h-16" }: { light?: boolean; className?: string }) {
  return (
    <div className="flex items-center">
      <img
        src={logoAora}
        alt="Aora Logo"
        className={`${className} w-auto object-contain`}
      />
    </div>
  );
}
