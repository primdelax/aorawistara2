// src/app/components/ProgramPage.tsx
import { useEffect, useState } from "react";
import { Clock, ImageOff, XCircle, Zap, GraduationCap, Calendar, ArrowRight, Check } from "lucide-react";
import { programApi, type Program } from "../lib/api";

// ─── Helpers ────────────────────────────────────────────────

function getImageSrc(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `/api${url.startsWith("/") ? "" : "/"}${url}`;
}

// ─── 3 Program Types Config ─────────────────────────────────

const PROGRAM_TYPES = [
  {
    key: "intensif",
    label: "Program Intensif",
    photo: "/program-intensif.png",
    desc: "Program pembelajaran intensif dengan jadwal padat dan materi mendalam. Cocok untuk peserta yang ingin menguasai keahlian dalam waktu singkat.",
    icon: Zap,
    features: ["Jadwal harian terstruktur", "Bimbingan langsung instruktur", "Sertifikat kelulusan resmi"],
    overlay: "linear-gradient(180deg, rgba(4,10,24,0.45) 0%, rgba(4,10,24,0.92) 55%, rgba(4,10,24,0.98) 100%)",
    accentColor: "#E63946",
    accentBg: "rgba(230,57,70,0.22)",
    accentText: "#ff8a8f",
    iconBg: "rgba(230,57,70,0.22)",
    borderHover: "#E63946",
  },
  {
    key: "bimbel",
    label: "Program Bimbel",
    photo: "/program-bimbel.png",
    desc: "Bimbingan belajar terstruktur dengan pendekatan personal dan interaktif. Fokus penguatan dasar hingga mahir sesuai kecepatan belajar peserta.",
    icon: GraduationCap,
    features: ["Pendekatan personal", "Kelas kecil & interaktif", "Evaluasi berkala per peserta"],
    overlay: "linear-gradient(180deg, rgba(60,8,12,0.45) 0%, rgba(80,10,16,0.92) 55%, rgba(90,8,14,0.98) 100%)",
    accentColor: "#ff6b6b",
    accentBg: "rgba(255,107,107,0.18)",
    accentText: "#ffaaaa",
    iconBg: "rgba(255,255,255,0.15)",
    borderHover: "#ff6b6b",
  },
  {
    key: "reguler",
    label: "Program Reguler",
    photo: "/program-reguler.png",
    desc: "Program pembelajaran rutin dengan jadwal fleksibel dan biaya terjangkau. Ideal bagi peserta yang ingin belajar konsisten tanpa tekanan waktu.",
    icon: Calendar,
    features: ["Jadwal fleksibel", "Biaya terjangkau", "Materi bertahap & terstruktur"],
    overlay: "linear-gradient(180deg, rgba(5,24,18,0.45) 0%, rgba(8,40,28,0.92) 55%, rgba(10,45,30,0.98) 100%)",
    accentColor: "#4dd9ac",
    accentBg: "rgba(77,217,172,0.18)",
    accentText: "#6aefc2",
    iconBg: "rgba(77,217,172,0.18)",
    borderHover: "#4dd9ac",
  },
];

// ─── Inline styles for hover animation (CSS-in-JS via style tag) ─

const hoverStyles = `
  .prog-card {
    transform: translateY(0) scale(1);
    transition: transform 0.32s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.25s ease;
    cursor: pointer;
  }
  .prog-card:hover {
    transform: translateY(-10px) scale(1.025);
    box-shadow: 0 32px 64px -12px rgba(0,0,0,0.5);
  }
  .prog-card .prog-img {
    transition: transform 0.5s ease;
  }
  .prog-card:hover .prog-img {
    transform: scale(1.07);
  }
  .prog-card .prog-cta {
    transition: opacity 0.25s, transform 0.25s;
    opacity: 0;
    transform: translateY(8px);
  }
  .prog-card:hover .prog-cta {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ─── Program Type Card ───────────────────────────────────────

function ProgramTypeCard({ pt }: { pt: typeof PROGRAM_TYPES[0] }) {
  const Icon = pt.icon;
  return (
    <div
      className="prog-card relative rounded-3xl overflow-hidden border-2 border-white/5 flex flex-col"
      style={{ minHeight: 480, borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Background photo */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={pt.photo}
          alt={pt.label}
          className="prog-img w-full h-full object-cover"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0" style={{ background: pt.overlay }} />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 flex flex-col h-full">
        {/* Icon badge */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: pt.iconBg,
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "auto",
        }}>
          <Icon style={{ width: 26, height: 26, color: pt.accentColor }} />
        </div>

        {/* Spacer so content sits at bottom */}
        <div style={{ flex: 1, minHeight: 80 }} />

        {/* Category label */}
        <span style={{
          color: pt.accentText,
          fontSize: 11, fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 10,
          display: "block",
        }}>
          {pt.key === "intensif" ? "⚡ Intensif" : pt.key === "bimbel" ? "🎓 Bimbel" : "📅 Reguler"}
        </span>

        {/* TITLE — most prominent */}
        <h2 style={{
          color: "#ffffff",
          fontWeight: 900,
          fontSize: "clamp(26px, 3vw, 34px)",
          letterSpacing: "-0.035em",
          lineHeight: 1.1,
          marginBottom: 14,
          textShadow: "0 2px 20px rgba(0,0,0,0.6)",
        }}>
          {pt.label}
        </h2>

        {/* Description */}
        <p style={{
          color: "rgba(255,255,255,0.72)",
          fontSize: 14,
          lineHeight: 1.7,
          marginBottom: 20,
        }}>
          {pt.desc}
        </p>

        {/* Features */}
        <ul className="space-y-2 mb-6">
          {pt.features.map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                background: pt.accentBg,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Check style={{ width: 11, height: 11, color: pt.accentText }} />
              </div>
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5, fontWeight: 600 }}>{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA — appears on hover */}
        <a
          href="#program-list"
          className="prog-cta"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: pt.accentBg,
            color: pt.accentText,
            border: `1px solid ${pt.accentText}50`,
            backdropFilter: "blur(8px)",
            fontWeight: 800, fontSize: 13.5,
            padding: "11px 20px",
            borderRadius: 12,
            width: "fit-content",
            textDecoration: "none",
          }}
        >
          Lihat Program
          <ArrowRight style={{ width: 15, height: 15 }} />
        </a>
      </div>
    </div>
  );
}

// ─── Real Program Card (from DB) ────────────────────────────

function ProgramCard({ program, index }: { program: Program; index: number }) {
  const [imgError, setImgError] = useState(false);
  const imageSrc = getImageSrc(program.image_url);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#0A1F44]/8 hover:border-[#E63946]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col">
      <div className="relative h-44 bg-[#0A1F44]/5 overflow-hidden shrink-0">
        {imageSrc && !imgError ? (
          <img
            src={imageSrc}
            alt={program.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#0A1F44]/20">
            <ImageOff className="w-9 h-9" />
            <span className="text-xs font-semibold">Tidak ada gambar</span>
          </div>
        )}
        <div
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#0A1F44] text-white flex items-center justify-center text-xs"
          style={{ fontWeight: 900 }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        {program.category_name && (
          <span className="text-[#E63946] text-xs font-extrabold uppercase tracking-widest mb-1">
            {program.category_name}
          </span>
        )}
        <h3 className="text-[#0A1F44] mb-2" style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
          {program.title}
        </h3>
        {program.description && (
          <p className="text-[#0A1F44]/60 text-sm leading-relaxed line-clamp-2 flex-1">
            {program.description}
          </p>
        )}
        {program.duration && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[#0A1F44]/50 text-sm">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {program.duration}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#0A1F44]/8 shadow-sm animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-5/6 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export function ProgramPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await programApi.getAll({ status: "aktif" });
      setPrograms(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat program");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrograms(); }, []);

  return (
    <div>
      {/* Inject hover animation styles */}
      <style>{hoverStyles}</style>

      {/* ── Hero ── */}
      <section className="bg-[#0A1F44] text-white py-20 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#E63946]/20 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <span
            className="inline-block px-3 py-1 bg-[#E63946] text-white rounded-full uppercase text-xs"
            style={{ fontWeight: 800, letterSpacing: "0.15em" }}
          >
            Program &amp; Pelatihan
          </span>
          <h1
            className="mt-5"
            style={{ fontWeight: 900, fontSize: "clamp(44px, 7vw, 80px)", lineHeight: 0.95, letterSpacing: "-0.04em" }}
          >
            Program <span className="text-[#E63946]">Kami</span>
          </h1>
          <p className="mt-5 text-white/70 max-w-2xl">
            Pilihan pelatihan untuk membentuk keterampilan dan jati diri.
            Pilih program yang sesuai dengan passionmu dan jadilah luar biasa.
          </p>
        </div>
      </section>

      {/* ── 3 Program Type Cards ── */}
      <section className="py-16 bg-[#0c1220]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-[#E63946] text-xs font-extrabold uppercase tracking-widest mb-2">Jenis Program</p>
            <h2 className="text-white" style={{ fontWeight: 900, fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Temukan Program yang Tepat
            </h2>
            <p className="text-white/45 mt-2 max-w-xl text-sm leading-relaxed">
              Tiga jenis program pelatihan yang dirancang untuk berbagai kebutuhan dan gaya belajar.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PROGRAM_TYPES.map((pt) => (
              <ProgramTypeCard key={pt.key} pt={pt} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Program List from DB ── */}
      <section id="program-list" className="py-16 bg-[#F7F7F9]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-[#E63946] text-xs font-extrabold uppercase tracking-widest mb-2">Tersedia Sekarang</p>
            <h2 className="text-[#0A1F44]" style={{ fontWeight: 900, fontSize: "clamp(24px, 3.5vw, 36px)", letterSpacing: "-0.03em" }}>
              Semua Program Aktif
            </h2>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-[#E63946]" />
              </div>
              <p className="text-[#0A1F44] font-black text-lg mb-2">Gagal memuat program</p>
              <p className="text-[#0A1F44]/50 text-sm mb-5">{error}</p>
              <button onClick={fetchPrograms}
                className="px-6 py-2.5 bg-[#E63946] text-white rounded-full text-sm font-extrabold hover:bg-[#c0303b] transition-colors">
                Coba Lagi
              </button>
            </div>
          ) : programs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#0A1F44]/5 flex items-center justify-center mb-4">
                <ImageOff className="w-8 h-8 text-[#0A1F44]/30" />
              </div>
              <p className="text-[#0A1F44] font-black text-lg mb-2">Belum ada program</p>
              <p className="text-[#0A1F44]/50 text-sm">Program pelatihan belum tersedia. Silakan cek kembali nanti.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {programs.map((program, i) => (
                <ProgramCard key={program.id} program={program} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
