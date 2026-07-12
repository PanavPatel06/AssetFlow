import Eyebrow from "./Eyebrow";
import BlurInHeading from "@/components/motion/BlurInHeading";
import PixelGlyph from "@/components/motion/PixelGlyph";

// The standard top-of-screen block: animated pixel glyph + eyebrow pill + light
// heading that reveals word-by-word, an optional description, and actions.
export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-black/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <PixelGlyph seed={title || eyebrow || "assetflow"} size={36} />
        {eyebrow && <Eyebrow className="mt-3">{eyebrow}</Eyebrow>}
        <BlurInHeading
          text={title}
          as="h1"
          className="mt-3 text-3xl font-light tracking-tight text-foreground sm:text-4xl"
        />
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-black/45">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
