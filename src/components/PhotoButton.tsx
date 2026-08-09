import { ImageIcon } from "lucide-react";
import { googleImagesUrl } from "@/lib/googleImages";

type Size = "sm" | "md";

const BOX: Record<Size, string> = { sm: "h-8 w-8", md: "h-9 w-9" };
const ICON: Record<Size, number> = { sm: 14, md: 16 };

/** Opens Google Images prefilled with the plant name, in a new tab. */
export default function PhotoButton({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: Size;
  className?: string;
}) {
  return (
    <a
      href={googleImagesUrl(name)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      aria-label={`Найти фото ${name} в Google Картинках`}
      title="Фото в Google Картинках"
      className={`press flex ${BOX[size]} items-center justify-center rounded-full border border-line bg-card text-foreground transition-colors hover:border-foreground/40 hover:bg-paper ${className}`}
    >
      <ImageIcon size={ICON[size]} />
    </a>
  );
}
