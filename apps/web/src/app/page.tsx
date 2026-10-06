import Link from "next/link";
import {
  ArrowRight,
  CloudSun,
  Droplets,
  Leaf,
  MapPinned,
  Satellite,
  ShieldCheck,
  Sprout,
} from "lucide-react";

const highlights = [
  {
    icon: Satellite,
    title: "Satellite context, made useful",
    description:
      "NASA climate and soil-moisture observations become practical context for your next season.",
  },
  {
    icon: Sprout,
    title: "A rotation built for your land",
    description:
      "Explore a four-year crop sequence designed around Bangladesh’s three growing seasons.",
  },
  {
    icon: ShieldCheck,
    title: "Clear about what we know",
    description:
      "See sources, confidence, and honest ranges. Regional satellite data is never presented as field truth.",
  },
];

export default function LandingPage() {
  return (
    <main className="landing-page min-h-screen overflow-hidden bg-[#f5f4ec] text-[#183a2b]">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3" aria-label="TerraShift home">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1c5039] text-[#d8ee9b] shadow-lg shadow-[#183a2b]/15">
            <Sprout size={24} />
          </span>
          <span>
            <span className="block text-xl font-extrabold tracking-tight">TerraShift</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-[#66816e]">
              Farming with foresight
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#557160] md:flex">
          <a href="#approach" className="transition hover:text-[#1c5039]">Our approach</a>
          <a href="#science" className="transition hover:text-[#1c5039]">The science</a>
        </nav>
        <Link
          href="/dashboard"
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1c5039] px-5 text-sm font-bold text-white shadow-lg shadow-[#1c5039]/15 transition hover:-translate-y-0.5 hover:bg-[#133c2b]"
        >
          Open dashboard <ArrowRight size={16} />
        </Link>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-8 sm:px-8 md:pt-10 lg:grid-cols-[1.02fr_.98fr] lg:px-12 lg:pb-28">
        <div className="relative z-[1]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cad9bd] bg-white/70 px-3.5 py-2 text-xs font-bold text-[#38684b]">
            <span className="h-2 w-2 rounded-full bg-[#75a950]" />
            Climate-smart planning for delta farms
          </div>
          <h1 className="max-w-2xl text-[clamp(3.2rem,7vw,6.25rem)] font-semibold leading-[.98] tracking-[-.065em] text-[#183a2b]">
            Grow with the
            <span className="block font-serif font-medium italic text-[#6d8d52]">seasons, not</span>
            against them.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#607667] sm:text-lg sm:leading-8">
            A clearer way for Bangladesh’s smallholder farmers to plan what comes
            next—grounded in NASA Earth observations, local crop knowledge, and
            the realities of your own field.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#1c5039] px-7 text-sm font-bold text-white shadow-xl shadow-[#1c5039]/20 transition hover:-translate-y-0.5 hover:bg-[#133c2b]"
            >
              Explore your farm <ArrowRight size={17} />
            </Link>
            <a
              href="#approach"
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#cdd8c8] bg-white/55 px-7 text-sm font-bold text-[#335841] transition hover:bg-white"
            >
              See how it works
            </a>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-[#6e8373]">
            <span className="inline-flex items-center gap-2"><MapPinned size={15} /> Built for delta farms</span>
            <span className="inline-flex items-center gap-2"><Droplets size={15} /> Water-aware planning</span>
            <span className="inline-flex items-center gap-2"><Leaf size={15} /> Designed to work offline</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[590px]">
          <div className="field-art absolute -inset-8 rounded-[3rem] opacity-70 blur-2xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[#183d2d] p-3 shadow-[0_35px_100px_-35px_rgba(24,58,43,.55)] sm:p-4">
            <div className="field-landscape relative min-h-[430px] overflow-hidden rounded-[1.45rem] p-5 sm:min-h-[490px] sm:p-7">
              <div className="absolute inset-0 bg-gradient-to-b from-[#183b2e]/60 via-transparent to-[#142f25]/75" />
              <div className="relative flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><Sprout size={17} /></span>
                  <span className="text-xs font-extrabold tracking-wide">TERRASHIFT</span>
                </div>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold backdrop-blur">FIELD OVERVIEW</span>
              </div>

              <div className="absolute left-5 right-5 top-[88px] rounded-2xl border border-white/25 bg-[#153b2d]/70 p-4 text-white shadow-lg backdrop-blur-xl sm:left-7 sm:right-7 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d3e9a0]">Your land, your next season</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">A plan that starts with your field.</h2>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d1eaa0] text-[#1b5038]"><Leaf size={19} /></span>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/75">Crop rotation and climate context, brought together in one simple view.</p>
              </div>

              <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-3 sm:bottom-7 sm:left-7 sm:right-7">
                <div className="rounded-2xl border border-white/20 bg-[#123727]/75 p-4 text-white shadow-lg backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-[#d3e9a0]"><CloudSun size={16} /><span className="text-[10px] font-bold uppercase tracking-wider">Climate context</span></div>
                  <p className="mt-3 text-sm font-bold">NASA POWER</p>
                  <p className="mt-1 text-[10px] leading-4 text-white/65">Conditions and trends, with source and freshness clearly shown.</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-[#123727]/75 p-4 text-white shadow-lg backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-[#d3e9a0]"><Sprout size={16} /><span className="text-[10px] font-bold uppercase tracking-wider">Seasonal plan</span></div>
                  <p className="mt-3 text-sm font-bold">4 years · 12 seasons</p>
                  <p className="mt-1 text-[10px] leading-4 text-white/65">A transparent crop rotation shaped by your planning priorities.</p>
                </div>
              </div>
              <div className="absolute bottom-[178px] right-7 hidden rounded-full border border-[#e9f3cf]/70 bg-[#d5e99a] p-3 text-[#234631] shadow-lg sm:block"><MapPinned size={18} /></div>
              <div className="absolute bottom-[204px] left-[18%] hidden rounded-full border border-white/60 bg-white/85 p-2.5 text-[#346948] shadow-md sm:block"><Sprout size={17} /></div>
              <div className="absolute right-[22%] top-[265px] hidden h-3 w-3 rounded-full bg-[#f2db80] shadow-[0_0_0_7px_rgba(242,219,128,.2)] sm:block" />
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 rounded-2xl border border-[#e1e8d8] bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:-left-8">
            <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#748775]">Grounded in evidence</p>
            <p className="mt-1 text-xs font-bold text-[#244b34]">No black-box recommendations</p>
          </div>
        </div>
      </section>

      <section id="approach" className="border-y border-[#dfe5d8] bg-white/55">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#77905e]">From observation to action</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Useful guidance, with the reasoning included.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="rounded-3xl border border-[#e3e8df] bg-[#fbfcf8] p-6 sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7efdc] text-[#426d48]"><Icon size={21} /></div>
                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#8b9b82]">0{index + 1}</p>
                <h3 className="mt-2 text-lg font-bold tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6d7f70]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="science" className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-16 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#77905e]">Built for the realities of farming</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">The right next step starts with what you know.</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#687c6d]">Add a field location and farm details, choose what matters most, then explore the crop plan and available Earth observation context. Keep your latest plan close, even when the connection drops.</p>
        </div>
        <Link href="/dashboard" className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 rounded-full bg-[#1c5039] px-7 text-sm font-bold text-white shadow-lg shadow-[#1c5039]/15 transition hover:-translate-y-0.5 hover:bg-[#133c2b]">
          Go to your dashboard <ArrowRight size={17} />
        </Link>
      </section>

      <footer className="border-t border-[#dfe5d8] px-5 py-6 text-center text-xs text-[#718171]">
        TerraShift · Climate-adaptive crop planning for Bangladesh’s delta farms
      </footer>
    </main>
  );
}
