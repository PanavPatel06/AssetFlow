import Eyebrow from "./Eyebrow";
import BlurInHeading from "@/components/motion/BlurInHeading";
import PixelGlyph from "@/components/motion/PixelGlyph";

// Maps each section's eyebrow label to the pixel glyph that depicts it.
const GLYPH_FOR_EYEBROW = {
  Overview: "dashboard",
  Assets: "assets",
  Allocation: "allocation",
  Bookings: "bookings",
  Maintenance: "maintenance",
  Audit: "audit",
  Reports: "reports",
  Activity: "activity",
  Organization: "organization",
};

// The standard top-of-screen block: purposeful pixel glyph + eyebrow pill +
// light heading that reveals word-by-word, an optional description, and actions.
export default function PageHeader({ eyebrow, title, description, actions, glyph }) {
  const kind = glyph || GLYPH_FOR_EYEBROW[eyebrow] || "brand";
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-black/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <PixelGlyph kind={kind} size={36} />
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
