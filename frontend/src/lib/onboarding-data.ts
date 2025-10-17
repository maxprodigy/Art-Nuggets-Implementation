import { Palette, Target, Film, Music, Hammer } from "lucide-react";

export interface Industry {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Niche {
  id: string;
  name: string;
  industryId: string;
}

export const industries: Industry[] = [
  {
    id: "visual-arts",
    name: "Visual Arts & Fine Art",
    description: "Painting, sculpture, illustration, and traditional art forms",
    icon: Palette,
  },
  {
    id: "design",
    name: "Design",
    description: "Graphic, product, fashion, and architectural design",
    icon: Target,
  },
  {
    id: "media-entertainment",
    name: "Media & Entertainment",
    description: "Film, gaming, publishing, and digital content",
    icon: Film,
  },
  {
    id: "performing-arts",
    name: "Performing Arts & Music",
    description: "Music, theater, dance, and live performances",
    icon: Music,
  },
  {
    id: "crafts",
    name: "Crafts & Artisan Products",
    description: "Handmade goods, traditional crafts, and artisanal products",
    icon: Hammer,
  },
];

export const niches: Niche[] = [
  // Visual Arts & Fine Art
  {
    id: "hyperrealism",
    name: "Hyperrealism painting",
    industryId: "visual-arts",
  },
  {
    id: "botanical-illustration",
    name: "Botanical illustration",
    industryId: "visual-arts",
  },
  {
    id: "pet-portraits",
    name: "Custom pet portraits",
    industryId: "visual-arts",
  },
  {
    id: "kinetic-sculpture",
    name: "Kinetic sculpture",
    industryId: "visual-arts",
  },
  {
    id: "fine-art-jewelry",
    name: "Fine art jewelry design",
    industryId: "visual-arts",
  },
  {
    id: "japanese-tattoo",
    name: "Traditional Japanese tattoo style",
    industryId: "visual-arts",
  },

  // Design
  {
    id: "brand-identity",
    name: "Brand identity for sustainable businesses",
    industryId: "design",
  },
  {
    id: "packaging-design",
    name: "Packaging design for craft beverages",
    industryId: "design",
  },
  {
    id: "ui-ux-illustration",
    name: "UI/UX illustration",
    industryId: "design",
  },
  {
    id: "sustainable-fashion",
    name: "Sustainable slow fashion",
    industryId: "design",
  },
  { id: "medical-device", name: "Medical device design", industryId: "design" },
  { id: "tiny-home", name: "Tiny home architecture", industryId: "design" },

  // Media & Entertainment
  {
    id: "documentary",
    name: "Independent documentary filmmaking",
    industryId: "media-entertainment",
  },
  {
    id: "stop-motion",
    name: "Stop-motion animation",
    industryId: "media-entertainment",
  },
  {
    id: "concept-art",
    name: "Concept art for video games",
    industryId: "media-entertainment",
  },
  {
    id: "interactive-fiction",
    name: "Narrative writing for interactive fiction",
    industryId: "media-entertainment",
  },
  {
    id: "health-copywriting",
    name: "Copywriting for health/wellness brands",
    industryId: "media-entertainment",
  },
  {
    id: "ebook-covers",
    name: "E-book cover design for specific fiction genres",
    industryId: "media-entertainment",
  },

  // Performing Arts & Music
  { id: "film-scoring", name: "Film scoring", industryId: "performing-arts" },
  {
    id: "lofi-production",
    name: "Music production for niche genres (e.g., lo-fi hip hop)",
    industryId: "performing-arts",
  },
  { id: "music-therapy", name: "Music therapy", industryId: "performing-arts" },
  {
    id: "immersive-theater",
    name: "Immersive theater production",
    industryId: "performing-arts",
  },
  {
    id: "costume-restoration",
    name: "Historical costume restoration",
    industryId: "performing-arts",
  },
  {
    id: "lighting-design",
    name: "Lighting design for stage shows",
    industryId: "performing-arts",
  },

  // Crafts & Artisan Products
  {
    id: "hand-dyed-yarn",
    name: "Custom hand-dyed yarns",
    industryId: "crafts",
  },
  {
    id: "ceramic-art",
    name: "Ceramic functional art (specific pottery)",
    industryId: "crafts",
  },
  {
    id: "woodworking",
    name: "Unique woodworking/furniture",
    industryId: "crafts",
  },
  { id: "macrame", name: "Macrame wall hangings", industryId: "crafts" },
];

export const getNichesByIndustry = (industryId: string): Niche[] => {
  return niches.filter((niche) => niche.industryId === industryId);
};
