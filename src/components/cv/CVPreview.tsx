"use client";

import { CVSection } from "@/types/cv";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CVPreviewProps {
  sections: CVSection[];
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

export function CVPreview({ sections, name, email, phone, city, linkedinUrl, websiteUrl }: CVPreviewProps) {
  return (
    <div className="bg-white text-gray-900 rounded-lg shadow-sm p-8 space-y-5 text-sm font-sans min-h-[600px]" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      {name && (
        <div className="text-center space-y-1 border-b border-gray-300 pb-4">
          <h1 className="text-2xl font-bold tracking-wide text-gray-900">{name}</h1>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600">
            {email && <span>{email}</span>}
            {phone && <span>•</span>}
            {phone && <span>{phone}</span>}
            {city && <span>•</span>}
            {city && <span>{city}</span>}
            {linkedinUrl && <span>•</span>}
            {linkedinUrl && <a href={linkedinUrl} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">LinkedIn</a>}
            {websiteUrl && <span>•</span>}
            {websiteUrl && <a href={websiteUrl} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">Portfolio</a>}
          </div>
        </div>
      )}

      {sections.map(section => (
        <div key={section.id} className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1">
            {section.title}
          </h2>
          <SectionContent section={section} />
        </div>
      ))}
    </div>
  );
}

function SectionContent({ section }: { section: CVSection }) {
  const c = section.content;

  switch (section.type) {
    case 'summary':
      return <p className="text-gray-700 leading-relaxed">{c?.text}</p>;

    case 'skills':
      return (
        <div className="space-y-1">
          {(c?.categories ?? []).map((cat: { name: string; skills: string[] }) => (
            <div key={cat.name} className="flex gap-2 flex-wrap">
              <span className="font-semibold text-gray-700 w-28 shrink-0">{cat.name}:</span>
              <span className="text-gray-600">{(cat.skills ?? []).join(', ')}</span>
            </div>
          ))}
          {/* Fallback: flat skills list */}
          {!c?.categories && Array.isArray(c?.skills) && (
            <div className="flex flex-wrap gap-1.5">
              {(c.skills as string[]).map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
            </div>
          )}
        </div>
      );

    case 'experience':
      return (
        <div className="space-y-3">
          {(c?.items ?? []).map((item: { title: string; company: string; startDate: string; endDate: string; bullets: string[] }, i: number) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-gray-800">{item.title}</span>
                <span className="text-xs text-gray-500 shrink-0 ml-2">{item.startDate} – {item.endDate}</span>
              </div>
              <p className="text-xs text-gray-500 italic">{item.company}</p>
              <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                {(item.bullets ?? []).map((b: string, j: number) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'projects':
      return (
        <div className="space-y-3">
          {(c?.items ?? []).map((item: { name: string; description: string; techStack: string[]; impact?: string }, i: number) => (
            <div key={i} className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{item.name}</span>
                {(item.techStack ?? []).slice(0, 4).map((t: string) => (
                  <Badge key={t} variant="outline" className="text-[10px] px-1 py-0">{t}</Badge>
                ))}
              </div>
              <p className="text-gray-700">{item.description}</p>
              {item.impact && <p className="text-xs text-green-700 font-medium">↑ {item.impact}</p>}
            </div>
          ))}
        </div>
      );

    case 'education':
      return (
        <div className="space-y-2">
          {(c?.items ?? []).map((item: { degree: string; field: string; institution: string; startDate: string; endDate: string; gpa?: string }, i: number) => (
            <div key={i} className="flex justify-between items-baseline">
              <div>
                <span className="font-semibold text-gray-800">{item.degree} in {item.field}</span>
                <span className="text-gray-500"> — {item.institution}</span>
                {item.gpa && <span className="text-xs text-gray-400 ml-2">GPA: {item.gpa}</span>}
              </div>
              <span className="text-xs text-gray-500 shrink-0 ml-2">{item.startDate} – {item.endDate}</span>
            </div>
          ))}
        </div>
      );

    case 'certifications':
      return (
        <div className="space-y-1">
          {(c?.items ?? []).map((item: { name: string; organization: string; date: string }, i: number) => (
            <div key={i} className="flex justify-between items-baseline">
              <span className="text-gray-800">{item.name} <span className="text-gray-500 text-xs">— {item.organization}</span></span>
              <span className="text-xs text-gray-500 shrink-0 ml-2">{item.date}</span>
            </div>
          ))}
        </div>
      );

    default:
      return <pre className="text-xs text-gray-500 whitespace-pre-wrap">{JSON.stringify(c, null, 2)}</pre>;
  }
}

// Re-export Separator to suppress import warning from other files if needed
export { Separator };
