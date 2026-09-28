export const CATEGORIES = [
  {
    slug: "it",
    name: "IT",
    keywords: [
      "software",
      "developer",
      "devops",
      "javascript",
      "react",
      "python",
      "java ",
      "information technology",
      "cyber",
      "data scientist",
      "data analyst",
      "it support",
      "network engineer",
      "full stack",
      "frontend",
      "backend",
    ],
  },
  {
    slug: "accounting",
    name: "Accounting",
    keywords: ["accountant", "accounting", "audit", "bookkeep", "accounts payable", "accounts receivable"],
  },
  {
    slug: "sales",
    name: "Sales",
    keywords: ["sales", "business development", "account executive"],
  },
  {
    slug: "marketing",
    name: "Marketing",
    keywords: ["marketing", "seo", "social media", "brand manager", "content writer"],
  },
  {
    slug: "engineering",
    name: "Engineering",
    keywords: ["engineer", "engineering", "mechanical", "electrical", "civil engineer"],
  },
  {
    slug: "administration",
    name: "Administration",
    keywords: ["admin", "administrator", "receptionist", "office assistant", "data entry", "secretary"],
  },
  {
    slug: "hr",
    name: "HR",
    keywords: ["human resource", "hr ", "recruiter", "talent acquisition"],
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    keywords: ["nurse", "doctor", "pharmacist", "clinic", "medical", "healthcare", "hospital"],
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    keywords: ["hotel", "hospitality", "chef", "waiter", "housekeeping", "restaurant", "barista"],
  },
  {
    slug: "construction",
    name: "Construction",
    keywords: ["construction", "site engineer", "quantity surveyor", "mason", "foreman", "hvac"],
  },
  {
    slug: "logistics",
    name: "Logistics",
    keywords: ["logistics", "warehouse", "supply chain", "storekeeper", "procurement"],
  },
  {
    slug: "driver",
    name: "Driver",
    keywords: ["driver", "chauffeur", "rider"],
  },
  {
    slug: "security",
    name: "Security",
    keywords: ["security guard", "security officer", "bouncer"],
  },
  {
    slug: "retail",
    name: "Retail",
    keywords: ["retail", "cashier", "merchandiser", "store supervisor"],
  },
  {
    slug: "education",
    name: "Education",
    keywords: ["teacher", "tutor", "lecturer", "professor", "education"],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    keywords: ["real estate", "property consultant", "broker"],
  },
  {
    slug: "banking",
    name: "Banking",
    keywords: ["bank", "banking", "teller", "credit analyst", "relationship manager"],
  },
  {
    slug: "aviation",
    name: "Aviation",
    keywords: ["aviation", "cabin crew", "pilot", "airport", "ground staff"],
  },
  {
    slug: "customer-service",
    name: "Customer Service",
    keywords: ["customer service", "call center", "contact centre", "helpdesk"],
  },
  {
    slug: "design",
    name: "Design",
    keywords: ["graphic designer", "ui designer", "ux designer", "interior designer"],
  },
  {
    slug: "legal",
    name: "Legal",
    keywords: ["lawyer", "legal", "advocate", "paralegal"],
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function categoryBySlug(slug: string | undefined | null) {
  return CATEGORIES.find((category) => category.slug === slug);
}
