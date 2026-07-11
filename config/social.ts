export const socialLinks = [
  {
    id: "instagram",
    label: "Follow Formula Room on Instagram",
    href: "https://www.instagram.com/formula.room",
  },
  {
    id: "x",
    label: "Follow Formula Room on X",
    href: "https://x.com/formularoom",
  },
  {
    id: "threads",
    label: "Follow Formula Room on Threads",
    href: "https://www.threads.net/@formula.room",
  },
] as const;

export type SocialLinkId = (typeof socialLinks)[number]["id"];
