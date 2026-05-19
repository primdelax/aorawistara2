// src/app/components/ProgramPage.tsx
import { useEffect, useState } from "react";
import { Clock, Tag, CheckCircle2, XCircle, ImageOff } from "lucide-react";
import { programApi, type Program } from "../lib/api";

// ─── Helpers ────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

function getImageSrc(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `/api${url.startsWith("/") ? "" : "/"}${url}`;
}

// ─── Sub-components ─────────────────────────────────────────

function StatusBadge({ status }: { status: Program["status"] }) {
  const isActive = status === "aktif";
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs border border-green-200 font-extrabold">
      <CheckCircle2 className="w-3 h-3" />
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-extrabold">
      <XCircle className="w-3 h-3" />
      Tidak Aktif
    </span>
  );
}

function ProgramCard({ program, num }: { program: Program; num: string }) {
  const [imgError, setImgError] = useState(false);
  const imageSrc = getImageSrc(program.image_url);

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border-2 border-transparent hover:border-[#E63946] hover:-translate-y-1 transition-all shadow-sm hover:shadow-md">
      {/* Image */}
      <div className="relative h-48 bg-[#0A1F44]/5 overflow-hidden">
        {imageSrc && !imgError ? (
          <img
            src={imageSrc}
            alt={program.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#0A1F44]/20">
            <ImageOff className="w-10 h-10" />
            <span className="text-xs font-semibold">Tidak ada gambar</span>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={program.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Number */}
        <span
          className="text-[#0A1F44]/10 select-none"
          style={{ fontWeight: 900, fontSize: "52px", letterSpacing: "-0.05em", lineHeight: 1 }}
        >
          {num}
        </span>

        {/* Category */}
        {program.category_name && (
          <span className="flex items-center gap-1 text-[#E63946] text-xs font-bold mt-1 uppercase tracking-widest">
            <Tag className="w-3 h-3" />
            {program.category_name}
          </span>
        )}

        {/* Title */}
        <h3
          className="text-[#0A1F44] mt-2"
          style={{ fontWeight: 900, fontSize: "22px", letterSpacing: "-0.02em" }}
        >
          {program.title}
        </h3>

        {/* Description */}
        {program.description && (
          <p className="mt-2 text-[#0A1F44]/65 text-sm leading-relaxed line-clamp-3">
            {program.description}
          </p>
        )}

        {/* Meta: duration + price */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          {program.duration && (
            <span className="flex items-center gap-1.5 text-[#0A1F44]/60 text-sm">
              <Clock className="w-4 h-4 shrink-0" />
              {program.duration}
            </span>
          )}
          <span
            className="text-[#E63946] font-black text-lg ml-auto"
            style={{ letterSpacing: "-0.02em" }}
          >
            {formatPrice(program.price)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border-2 border-transparent shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-10 w-12 bg-gray-100 rounded" />
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-5/6 bg-gray-100 rounded" />
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
          <div className="h-4 w-24 bg-gray-100 rounded" />
          <div className="h-5 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-[#0A1F44]/5 flex items-center justify-center mb-5">
        <ImageOff className="w-9 h-9 text-[#0A1F44]/30" />
      </div>
      <h3
        className="text-[#0A1F44]"
        style={{ fontWeight: 900, fontSize: "24px", letterSpacing: "-0.02em" }}
      >
        Belum ada program
      </h3>
      <p className="mt-2 text-[#0A1F44]/50 max-w-xs">
        Program pelatihan belum tersedia saat ini. Silakan cek kembali nanti.
      </p>
    </div>
  );
}

// ─── Error state ─────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
        <XCircle className="w-9 h-9 text-[#E63946]" />
      </div>
      <h3
        className="text-[#0A1F44]"
        style={{ fontWeight: 900, fontSize: "24px", letterSpacing: "-0.02em" }}
      >
        Gagal memuat program
      </h3>
      <p className="mt-2 text-[#0A1F44]/50 max-w-xs mb-6">
        Terjadi kesalahan saat mengambil data program dari server.
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-[#E63946] text-white rounded-full text-sm font-extrabold hover:bg-[#c0303b] transition-colors"
      >
        Coba Lagi
      </button>
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

  useEffect(() => {
    fetchPrograms();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#0A1F44] text-white py-20 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#E63946]/20 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <span
            className="inline-block px-3 py-1 bg-[#E63946] text-white rounded-full uppercase text-xs"
            style={{ fontWeight: 800, letterSpacing: "0.15em" }}
          >
            Program & Pelatihan
          </span>
          <h1
            className="mt-5"
            style={{
              fontWeight: 900,
              fontSize: "clamp(44px, 7vw, 80px)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
            }}
          >
            Program <span className="text-[#E63946]">Kami</span>
          </h1>
          <p className="mt-5 text-white/70 max-w-2xl">
            Pilihan pelatihan untuk membentuk keterampilan dan jati diri.
            Pilih program yang sesuai dengan passionmu dan jadilah luar biasa.
          </p>
        </div>
      </section>

      {/* Program Grid */}
      <section className="py-20 bg-[#F7F7F9]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : error ? (
            <ErrorState onRetry={fetchPrograms} />
          ) : programs.length === 0 ? (
            <EmptyState />
          ) : (
            programs.map((program, i) => (
              <ProgramCard
                key={program.id}
                program={program}
                num={String(i + 1).padStart(2, "0")}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
