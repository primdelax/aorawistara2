import { MapPin, Mail, Phone, Instagram, Facebook, Clock } from "lucide-react";
import { WhatsAppIcon } from "./HomePage";
import { TikTokIcon } from "./Footer";

const WA = "https://wa.me/6281234567890";

export function KontakPage() {
  return (
    <div>
      <section className="bg-[#0A1F44] text-white py-20 relative overflow-hidden">
        <div className="absolute -top-20 right-1/3 w-[400px] h-[400px] rounded-full bg-[#E63946]/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6">
          <span className="inline-block px-3 py-1 bg-[#E63946] text-white rounded-full uppercase text-xs" style={{ fontWeight: 800, letterSpacing: "0.15em" }}>
            Hubungi Kami
          </span>
          <h1 className="mt-5" style={{ fontWeight: 900, fontSize: "clamp(44px, 7vw, 80px)", lineHeight: 0.95, letterSpacing: "-0.04em" }}>
            Mari <span className="text-[#E63946]">Terhubung</span>
          </h1>
          <p className="mt-5 text-white/70 max-w-2xl">
            Tim Aora siap menjawab pertanyaanmu. Konsultasi gratis dan respon cepat via WhatsApp.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10">
          {/* Info */}
          <div>
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="block bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-3xl p-8 transition-all hover:scale-[1.01] shadow-xl shadow-[#25D366]/20"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <WhatsAppIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="uppercase text-xs tracking-widest opacity-80" style={{ fontWeight: 800 }}>Chat Langsung</p>
                  <p style={{ fontWeight: 900, fontSize: "28px", letterSpacing: "-0.02em" }}>WhatsApp Kami</p>
                  <p className="opacity-90">+62 812-3456-7890</p>
                </div>
              </div>
            </a>

            <div className="mt-6 bg-[#F7F7F9] rounded-3xl p-8">
              <h3 className="text-[#0A1F44]" style={{ fontWeight: 900, fontSize: "22px", letterSpacing: "-0.02em" }}>
                Informasi Kontak
              </h3>
              <div className="mt-5 space-y-4">
                <ContactRow icon={<MapPin />} label="Alamat" value="Jl. Pelatihan No. 1, Indonesia" />
                <ContactRow icon={<Mail />} label="Email" value="aora@gmail.com" />
                <ContactRow icon={<Phone />} label="Telepon" value="+62 812-3456-7890" />
                <ContactRow icon={<Clock />} label="Jam Operasional" value="Senin – Sabtu, 08:00 – 17:00 WIB" />
              </div>
            </div>

            <div className="mt-6 bg-[#0A1F44] text-white rounded-3xl p-8">
              <h3 className="text-[#E63946] uppercase text-xs tracking-widest" style={{ fontWeight: 800, letterSpacing: "0.2em" }}>
                Sosial Media
              </h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SocialRow icon={<Instagram />} label="Instagram" value="@aora" />
                <SocialRow icon={<TikTokIcon className="w-5 h-5" />} label="TikTok" value="@aora" />
                <SocialRow icon={<Facebook />} label="Facebook" value="Aora" />
                <SocialRow icon={<Mail />} label="Email" value="aora@gmail.com" />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="rounded-3xl overflow-hidden border-2 border-[#0A1F44]/10 bg-[#F7F7F9] aspect-[4/5] relative">
              <iframe
                title="AORA Map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=106.8%2C-6.21%2C106.85%2C-6.18&layer=mapnik"
                className="w-full h-full"
                style={{ border: 0 }}
              />
              <div className="absolute top-4 left-4 bg-white px-4 py-3 rounded-2xl shadow-xl">
                <p className="text-[#E63946] uppercase text-xs" style={{ fontWeight: 800, letterSpacing: "0.15em" }}>Lokasi</p>
                <p className="text-[#0A1F44]" style={{ fontWeight: 800 }}>Aora LKP</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0A1F44] text-white py-20 relative overflow-hidden">
        <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-[#E63946]/15 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 style={{ fontWeight: 900, fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1, letterSpacing: "-0.03em" }}>
            Siap memulai perjalanan <span className="text-[#E63946]">luar biasa?</span>
          </h2>
          <p className="mt-5 text-white/70 max-w-xl mx-auto">
            Tim kami akan membantumu memilih program yang paling sesuai. Gratis dan tanpa komitmen.
          </p>
          <a
            href={WA}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-3 bg-white text-[#0A1F44] px-8 py-4 rounded-full transition-all hover:scale-[1.02] hover:bg-[#E63946] hover:text-white shadow-xl"
            style={{ fontWeight: 800 }}
          >
            <WhatsAppIcon /> Hubungi Kami via WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#E63946] text-white flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[#0A1F44]/60 uppercase text-xs" style={{ fontWeight: 700, letterSpacing: "0.15em" }}>{label}</p>
        <p className="text-[#0A1F44]" style={{ fontWeight: 700 }}>{value}</p>
      </div>
    </div>
  );
}

function SocialRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 hover:bg-[#E63946] transition-colors rounded-xl px-4 py-3 cursor-pointer">
      <div className="text-[#E63946] group-hover:text-white">{icon}</div>
      <div>
        <p className="text-white/60 text-xs uppercase" style={{ fontWeight: 700, letterSpacing: "0.1em" }}>{label}</p>
        <p style={{ fontWeight: 700 }}>{value}</p>
      </div>
    </div>
  );
}
