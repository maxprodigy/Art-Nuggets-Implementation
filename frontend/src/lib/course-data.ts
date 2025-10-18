export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  category: "Music" | "Design" | "Visual Arts" | "Business";
  isNew: boolean;
}

export const courses: Course[] = [
  // New In courses
  {
    id: "artist-contracts",
    title: "Artist Contracts",
    description:
      "Master the fundamentals of contract law and negotiation strategies designed specifically for creative professionals and entrepreneurs. Learn how to protect your rights and secure better deals.",
    image: "/features-img-1.png",
    category: "Visual Arts",
    isNew: true,
  },
  {
    id: "music-contracts",
    title: "Music Contracts",
    description:
      "Navigate the complex world of music industry contracts, from recording agreements to publishing deals and performance rights. Essential knowledge for musicians and producers.",
    image: "/features-img-2.png",
    category: "Music",
    isNew: true,
  },

  // Popular courses
  {
    id: "contracts-101",
    title: "Contracts 101",
    description:
      "Master the fundamentals of contract law and negotiation strategies designed specifically for creative professionals and entrepreneurs.",
    image: "/Learn-img-1.png",
    category: "Business",
    isNew: false,
  },
  {
    id: "music-deals",
    title: "Music Deals",
    description:
      "Navigate the complex world of music industry contracts, from recording agreements to publishing deals and performance rights.",
    image: "/Learn-img-2.png",
    category: "Music",
    isNew: false,
  },
  {
    id: "art-contracts-beginners",
    title: "Art Contracts For Beginners",
    description:
      "Learn essential contract principles for visual artists, including commission agreements, licensing deals, and gallery contracts.",
    image: "/Learn-img-3.png",
    category: "Visual Arts",
    isNew: false,
  },
  {
    id: "design-agreements",
    title: "Design Agreements",
    description:
      "Comprehensive guide to design contracts, intellectual property rights, and client agreements for graphic designers and creative agencies.",
    image: "/features-img-3.png",
    category: "Design",
    isNew: false,
  },
  {
    id: "business-legal-basics",
    title: "Business Legal Basics",
    description:
      "Essential legal knowledge for creative entrepreneurs, covering business formation, contracts, and intellectual property protection.",
    image: "/features-img-4.png",
    category: "Business",
    isNew: false,
  },
];

export const categories = [
  "Music",
  "Design",
  "Visual Arts",
  "Business",
] as const;

export const getCoursesByCategory = (category: string): Course[] => {
  if (category === "All") return courses;
  return courses.filter((course) => course.category === category);
};

export const getNewCourses = (): Course[] => {
  return courses.filter((course) => course.isNew);
};

export const getPopularCourses = (): Course[] => {
  return courses.filter((course) => !course.isNew);
};
