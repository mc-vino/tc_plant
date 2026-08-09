import Image from "next/image";
import { asset } from "@/lib/asset";
import { getProduct } from "@/lib/catalog";

/** Foliage photos from the catalogue itself, used only as atmosphere. */
const BACKDROP_CODES = [
  "AL050",
  "AL062",
  "AL018",
  "AL070",
  "AL061",
  "AL042",
  "AL019",
  "AL033",
  "MT041",
  "PD066",
  "AL056",
  "AL040",
];

/**
 * Full-bleed botanical layer: real foliage, blurred hard so it reads as
 * atmosphere rather than content, then faded into the parchment canvas at
 * every edge so the section has no visible image boundary.
 */
export default function BotanicalBackdrop() {
  const shots = BACKDROP_CODES.map((c) => getProduct(c)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p?.image),
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* scale-125 keeps the blur from softening the section's own edges */}
      <div className="absolute inset-0 grid scale-125 grid-cols-3 grid-rows-4 blur-[20px] sm:grid-cols-4 sm:grid-rows-3">
        {shots.map((p) => (
          <div key={p.code} className="relative">
            <Image
              src={asset(p.image!)}
              alt=""
              fill
              sizes="(max-width: 640px) 34vw, 25vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Wash the imagery back so sepia text keeps its contrast. */}
      <div className="absolute inset-0 bg-background/58" />

      {/* Vignette into the canvas: no hard image boundary anywhere. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, rgba(250,248,245,0) 34%, rgba(250,248,245,0.88) 80%, #faf8f5 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
