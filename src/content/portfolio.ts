import placeholder3 from "@/assets/project-placeholder-3.jpg";

export const profile = {
  name: "Franz Lyster L. Tagalogon",
  title: "IT Support | Embedded Systems & Safety-Oriented Technical Professional",
  phone: "0938-835-8889",
  email: "franzlyster@gmail.com",
  summary:
    "Detail-oriented IT Technician with a background in Computer Engineering and hands-on experience in technical support, system maintenance, and troubleshooting. Skilled in hardware/software support, basic networking, and system configuration. Highly adaptable, reliable, and committed to continuous learning and delivering efficient technical solutions.",
};

export const skills: string[] = [
  "Hardware & Software Troubleshooting",
  "IT Support / Helpdesk",
  "Windows & Linux Systems",
  "Basic Networking (TCP/IP, troubleshooting)",
  "System Installation & Configuration",
  "Asset & Inventory Management",
  "Documentation & Reporting",
  "Customer Support & Communication",
];

export const education = {
  school: "Jose Rizal Memorial State University – Main Campus",
  degree: "Bachelor of Science in Computer Engineering",
  period: "2019 – 2023",
};

export type Certification = {
  name: string;
  issuer?: string;
  date: string;
};

export const certifications: Certification[] = [
  { name: "Google Cybersecurity Certificate", date: "July 29, 2024" },
  { name: "Junior Penetration Tester", issuer: "TryHackMe", date: "February 20, 2026" },
  { name: "Electronics Processing and Servicing", date: "March 26, 2026 – May 15, 2026" },
  { name: "Microsoft Azure AI Fundamentals", date: "June 10, 2026" },
];

export const technicalTools = [
  "Linux",
  "Python",
  "React",
  "Tailwind",
  "Microsoft Office",
  "Basic Networking Tools",
  "SIEM",
  "WordPress",
  "OpenCode",
  "n8n",
];

export type Job = {
  role: string;
  company?: string;
  period: string;
  bullets: string[];
};

export const jobs: Job[] = [
  {
    role: "Freelance Website Developer",
    period: "September 2025 – Present",
    bullets: ["Delivered professional websites"],
  },
  {
    role: "IT Staff / Office Support",
    company: "JMC Power Depot / Haitek Logistics Services",
    period: "Aug 2023 – August 2025",
    bullets: [
      "Provided technical support for hardware and software issues",
      "Maintained and monitored internal systems",
      "Managed records for inbound and outbound operations",
      "Assisted in troubleshooting and resolving system problems",
    ],
  },
  {
    role: "Freelance Embedded Systems Programmer",
    period: "Dec 2024 – Present",
    bullets: [
      "Developed and configured Arduino-based systems",
      "Diagnosed and resolved hardware/software issues",
      "Ensured proper system performance and functionality",
    ],
  },
  {
    role: "Freelance Photographer",
    period: "June 2016 – Present",
    bullets: [
      "Managed client requirements and delivered outputs on time",
      "Demonstrated strong time management and communication",
    ],
  },
];

export type Project = {
  /** Short arcade-cabinet label, keep it under ~14 characters. */
  label: string;
  name: string;
  blurb: string;
  tags: string[];
  image: string;
  /** Set to a real URL to turn on the VISIT SITE button. */
  url?: string;
  placeholder?: boolean;
};

/**
 * DELIVERED WEBSITES
 * Swap these placeholders for real projects: change name/blurb/tags, drop a
 * screenshot in src/assets, import it above, set `url`, and remove
 * `placeholder: true`.
 */
export const projects: Project[] = [
  {
    label: "ID SNAKES PH",
    name: "Identify Snakes in PH",
    blurb:
      "An AI-assisted guide for identifying Philippine snake species, with venom status, habitat information, and safety guidelines.",
    tags: ["Web App", "AI / Computer Vision", "TypeScript", "Tailwind CSS"],
    image: "/assets/projects/snake-guide-ph.png",
    url: "https://identifysnakesinph.freedev.app/?i=1",
  },
  {
    label: "SITE 02",
    name: "OroqCoco Store",
    blurb:
      "An online storefront for OroqCoco — virgin coconut oil, coco vinegars, aminos, magnesium wellness and charcoal briquettes, with a Payload CMS catalog and a clean checkout flow.",
    tags: ["Storefront", "CMS", "SEO"],
    image: "/assets/projects/logo.png",
    url: "https://oroq-coco-shop.vercel.app/",
  },
  {
    label: "SITE 03",
    name: "Client Website #3",
    blurb:
      "Placeholder slot. A dashboard style web app with live data panels and role-based access.",
    tags: ["Dashboard", "Database", "Auth"],
    image: placeholder3,
    placeholder: true,
  },
];
