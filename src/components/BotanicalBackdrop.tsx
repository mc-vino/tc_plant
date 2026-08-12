import Image from "next/image";
import { asset } from "@/lib/asset";
import { products } from "@/lib/catalog";

/** Twelve foliage photos spread across the published catalogue, as atmosphere. */
function backdropShots() {
  const withPhoto = products.filter((p) => p.image);
  if (withPhoto.length <= 12) return withPhoto;
  const step = Math.floor(withPhoto.length / 12);
  return Array.from({ length: 12 }, (_, i) => withPhoto[i * step]);
}

/**
 * Full-bleed botanical layer: real foliage, blurred hard so it reads as
 * atmosphere rather than content, then faded into the parchment canvas at
 * every edge so the section has no visible image boundary.
 */
export default function BotanicalBackdrop({
  variant = "hero",
}: {
  /** "hero" lets the flora read; "soft" pushes it back under dense content. */
  variant?: "hero" | "soft";
}) {
  const shots = backdropShots();

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
      <div
        className={
          variant === "hero" ? "absolute inset-0 bg-background/58" : "absolute inset-0 bg-background/82"
        }
      />

      {/* Vignette into the canvas: no hard image boundary anywhere. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, rgba(250,248,245,0) 34%, rgba(250,248,245,0.88) 80%, #faf8f5 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-b from-transparent to-background" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-t from-transparent to-background" />
    </div>
  );
}
