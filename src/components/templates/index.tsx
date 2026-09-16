import { GeneratedCV } from "@/types/cv";
import { ClassicTemplate, toHTML as classicHTML } from "./ClassicTemplate";
import { ModernTemplate, toHTML as modernHTML } from "./ModernTemplate";
import { TechTemplate, toHTML as techHTML } from "./TechTemplate";
import { CreativeTemplate, toHTML as creativeHTML } from "./CreativeTemplate";
import { ExecutiveTemplate, toHTML as executiveHTML } from "./ExecutiveTemplate";
import React from "react";

export interface TemplateContact {
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

export function cleanUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ContactLinks({ contact, color = "#444" }: { contact: TemplateContact; color?: string }) {
  const parts = [];
  if (contact.email) parts.push(<span key="email">{contact.email}</span>);
  if (contact.phone) parts.push(<span key="phone">{contact.phone}</span>);
  if (contact.city) parts.push(<span key="city">{contact.city}</span>);
  if (contact.linkedinUrl) parts.push(
    <a key="li" href={contact.linkedinUrl.startsWith('http') ? contact.linkedinUrl : `https://${contact.linkedinUrl}`} target="_blank" rel="noopener noreferrer" style={{ color, textDecoration: "none" }}>
      {cleanUrl(contact.linkedinUrl)}
    </a>
  );
  if (contact.websiteUrl) parts.push(
    <a key="web" href={contact.websiteUrl.startsWith('http') ? contact.websiteUrl : `https://${contact.websiteUrl}`} target="_blank" rel="noopener noreferrer" style={{ color, textDecoration: "none" }}>
      {cleanUrl(contact.websiteUrl)}
    </a>
  );

  if (parts.length === 0) return null;
  return <>{parts.reduce((prev, curr) => <>{prev} | {curr}</>)}</>;
}

export function getContactHTML(contact: TemplateContact, color = "#444"): string {
  const parts = [];
  if (contact.email) parts.push(`<span>${contact.email}</span>`);
  if (contact.phone) parts.push(`<span>${contact.phone}</span>`);
  if (contact.city) parts.push(`<span>${contact.city}</span>`);
  if (contact.linkedinUrl) {
    const href = contact.linkedinUrl.startsWith('http') ? contact.linkedinUrl : `https://${contact.linkedinUrl}`;
    parts.push(`<a href="${href}" style="color:${color};text-decoration:none;">${cleanUrl(contact.linkedinUrl)}</a>`);
  }
  if (contact.websiteUrl) {
    const href = contact.websiteUrl.startsWith('http') ? contact.websiteUrl : `https://${contact.websiteUrl}`;
    parts.push(`<a href="${href}" style="color:${color};text-decoration:none;">${cleanUrl(contact.websiteUrl)}</a>`);
  }
  return parts.join(" | ");
}

export interface TemplateDefinition {
  id: string;
  label: string;
  description: string;
  accent: string;
  /** Industries / seniority levels this template is recommended for */
  recommendedFor: { industries?: string[]; seniority?: string[] };
  component: React.FC<{ cv: GeneratedCV } & TemplateContact>;
  toHTML: (cv: GeneratedCV, contact: TemplateContact) => string;
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Universal. Single column, clean horizontal rules.",
    accent: "#1a1a1a",
    recommendedFor: { industries: ["finance", "law", "hr", "admin"] },
    component: ClassicTemplate,
    toHTML: classicHTML,
  },
  {
    id: "modern",
    label: "Modern",
    description: "Indigo accent header. Great for most industries.",
    accent: "#3b4fd8",
    recommendedFor: { industries: ["marketing", "product", "design", "business"] },
    component: ModernTemplate,
    toHTML: modernHTML,
  },
  {
    id: "tech",
    label: "Tech",
    description: "Teal accent. Projects prominent, monospace touches.",
    accent: "#0d9488",
    recommendedFor: { industries: ["software", "engineering", "data", "tech"], seniority: ["junior", "mid", "senior"] },
    component: TechTemplate,
    toHTML: techHTML,
  },
  {
    id: "creative",
    label: "Creative",
    description: "Coral section headers. Visual but ATS-safe.",
    accent: "#e05c3a",
    recommendedFor: { industries: ["design", "media", "content", "advertising"] },
    component: CreativeTemplate,
    toHTML: creativeHTML,
  },
  {
    id: "executive",
    label: "Executive",
    description: "Navy/gold serif. Structured for senior leadership.",
    accent: "#1a2e52",
    recommendedFor: { seniority: ["director", "vp", "executive", "c-level", "head", "lead"] },
    component: ExecutiveTemplate,
    toHTML: executiveHTML,
  },
];

/** Pick the best template ID based on job metadata */
export function recommendTemplate(industry: string, seniority: string): string {
  const lowerIndustry = industry.toLowerCase();
  const lowerSeniority = seniority.toLowerCase();

  for (const t of TEMPLATES) {
    const matchSeniority = t.recommendedFor.seniority?.some((s) => lowerSeniority.includes(s));
    if (matchSeniority) return t.id;
  }
  for (const t of TEMPLATES) {
    const matchIndustry = t.recommendedFor.industries?.some((ind) => lowerIndustry.includes(ind));
    if (matchIndustry) return t.id;
  }
  return "classic";
}
