import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import FloatingHearts from "./FloatingHearts";
import { togetherSince, togetherCopy } from "../data/content";
import { formatNumber, pad2 } from "../utils/numbers";

/**
 * بيحوّل "2025-02-14" لتاريخ حقيقي، ومبيرجّعش حاجة لو القيمة غلط أو في المستقبل
 * (كده لو التاريخ اتكتب غلط القسم بيختفي بدل ما يطلع أرقام غريبة).
 */
export function parseTogetherSince(value: string | null, now: Date): Date | null {
  if (!value) return null;

  const parts = value.split("-").map((p) => Number(p.trim()));
  if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n))) return null;

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  // تأكيد إن التاريخ صحيح فعلاً (مثلاً 31 فبراير هيتحوّل 3 مارس)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date.getTime() > now.getTime() ? null : date;
}

/** بشكل "14 · 2 · 2025" */
function formatTogetherDate(date: Date): string {
  return `${pad2(date.getDate())} · ${pad2(date.getMonth() + 1)} · ${date.getFullYear()}`;
}

export default function Together() {
  const [now, setNow] = useState(() => new Date());
  // بنحسب تاريخ البداية مرة واحدة بس عند فتح الموقع (لو حسبناها كل ثانية
  // كان المؤقت هيتصفّر ويعيد نفسه كل ثانية)
  const start = useMemo(() => parseTogetherSince(togetherSince, new Date()), []);

  useEffect(() => {
    if (!start) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [start]);

  // مفيش تاريخ متظبط → القسم مش بيظهر خالص
  if (!start) return null;

  const diff = Math.max(0, now.getTime() - start.getTime());
  const units = [
    { key: "days", value: String(Math.floor(diff / 86_400_000)) },
    { key: "hours", value: pad2(Math.floor((diff / 3_600_000) % 24)) },
    { key: "minutes", value: pad2(Math.floor((diff / 60_000) % 60)) },
    { key: "seconds", value: pad2(Math.floor((diff / 1000) % 60)) },
  ] as const;

  const totalDays = Math.floor(diff / 86_400_000);

  return (
    <section
      id="together"
      className="relative overflow-hidden bg-gradient-to-br from-rose-deep via-rose-mid to-plum py-20 text-white sm:py-28"
    >
      <FloatingHearts count={18} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-5">
        <Reveal className="text-center">
          <p className="font-script text-3xl text-gold-light sm:text-4xl">{togetherCopy.script}</p>
          <h2 className="mt-2 font-display text-4xl text-white sm:text-6xl">
            {togetherCopy.title}{" "}
            <span
              dir="ltr"
              className="mt-2 inline-block rounded-2xl border border-gold/40 bg-white/10 px-5 py-1 font-amiri text-2xl tracking-widest tabular-nums text-gold-light backdrop-blur-md sm:text-4xl"
            >
              {formatTogetherDate(start)}
            </span>
          </h2>
        </Reveal>

        {/* العداد الحيّ */}
        <Reveal delay={150} className="mt-12">
          <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2 sm:gap-5">
            {units.map((u) => (
              <div
                key={u.key}
                className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center shadow-lg backdrop-blur-md transition hover:-translate-y-1 sm:rounded-3xl sm:p-6"
              >
                <div
                  dir="ltr"
                  className="font-amiri text-2xl font-bold tabular-nums text-gold-light sm:text-5xl"
                >
                  {u.value}
                </div>
                <div className="mt-1 text-xs font-semibold text-rose-50/85 sm:mt-2 sm:text-base">
                  {togetherCopy.units[u.key]}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* أرقام إضافية */}
        <Reveal delay={250} className="mt-10">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 text-center">
            <span className="rounded-full bg-white/10 px-5 py-2 font-amiri text-lg text-rose-50 ring-1 ring-white/15 sm:text-xl">
              يعني{" "}
              <span dir="ltr" className="font-bold tabular-nums text-gold-light">
                {formatNumber(totalDays)}
              </span>{" "}
              يوم و{" "}
              <span dir="ltr" className="font-bold tabular-nums text-gold-light">
                {formatNumber(Math.floor(totalDays / 7))}
              </span>{" "}
              أسبوع من أول ما قلتيلي آه 💞
            </span>
          </div>
        </Reveal>

        <Reveal delay={350} className="mt-8 text-center">
          <p className="font-display text-2xl text-gold-light sm:text-4xl">{togetherCopy.line}</p>
        </Reveal>
      </div>
    </section>
  );
}
