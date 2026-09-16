import { GeneratedCV, CVSection } from "@/types/cv";

interface TemplateProps {
  cv: GeneratedCV;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

const ACCENT = "#3b4fd8"; // indigo

import { ContactLinks, getContactHTML } from ".";

export function ModernTemplate({ cv, name, email, phone, city, linkedinUrl, websiteUrl }: TemplateProps) {

  return (
    <div style={styles.page}>
      {/* Header block */}
      <div style={styles.header}>
        <div style={styles.stripe} />
        <div style={styles.headerContent}>
          <h1 style={styles.name}>{name}</h1>
          <div style={styles.contact}>
            <ContactLinks contact={{ name, email, phone, city, linkedinUrl, websiteUrl }} color="#555" />
          </div>
        </div>
      </div>

      <div style={styles.body}>
        {cv.sections.map((section) => (
          <div key={section.id} style={styles.section}>
            <h2 style={styles.sectionTitle}>{section.title}</h2>
            <SectionBody section={section} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionBody({ section }: { section: CVSection }) {
  const c = section.content;
  switch (section.type) {
    case "summary":
      return <p style={styles.bodyText}>{c?.text}</p>;

    case "skills":
      return (
        <div>
          {(c?.categories ?? []).map((cat: { name: string; skills: string[] }) => (
            <div key={cat.name} style={styles.skillRow}>
              <span style={styles.skillLabel}>{cat.name}:</span>{" "}
              <span style={styles.bodyText}>{(cat.skills ?? []).join(", ")}</span>
            </div>
          ))}
          {!c?.categories && Array.isArray(c?.skills) && (
            <p style={styles.bodyText}>{(c.skills as string[]).join(", ")}</p>
          )}
        </div>
      );

    case "experience":
      return (
        <div>
          {(c?.items ?? []).map(
            (item: { title: string; company: string; startDate: string; endDate: string; bullets: string[] }, i: number) => (
              <div key={i} style={styles.entry}>
                <div style={styles.entryHeader}>
                  <strong style={{ color: ACCENT }}>{item.title}</strong>
                  <span style={styles.date}>{item.startDate} – {item.endDate}</span>
                </div>
                <div style={styles.subtitle}>{item.company}</div>
                <ul style={styles.bullets}>
                  {(item.bullets ?? []).map((b: string, j: number) => <li key={j}>{b}</li>)}
                </ul>
              </div>
            )
          )}
        </div>
      );

    case "projects":
      return (
        <div>
          {(c?.items ?? []).map(
            (item: { name: string; description: string; techStack: string[]; impact?: string; bullets?: string[] }, i: number) => (
              <div key={i} style={styles.entry}>
                <div style={styles.entryHeader}>
                  <strong style={{ color: ACCENT }}>{item.name}</strong>
                  <span style={styles.techList}>{(item.techStack ?? []).join(", ")}</span>
                </div>
                {item.description && <p style={styles.bodyText}>{item.description}</p>}
                {item.impact && <p style={{ ...styles.bodyText, fontStyle: "italic" }}>Impact: {item.impact}</p>}
                {item.bullets && item.bullets.length > 0 && (
                  <ul style={styles.bullets}>
                    {item.bullets.map((b: string, j: number) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          )}
        </div>
      );

    case "education":
      return (
        <div>
          {(c?.items ?? []).map(
            (item: { degree: string; field: string; institution: string; startDate: string; endDate: string; gpa?: string }, i: number) => (
              <div key={i} style={{ ...styles.entryHeader, marginBottom: "6pt" }}>
                <div>
                  <strong>{item.degree} in {item.field}</strong>
                  <span style={styles.subtitle}> — {item.institution}</span>
                  {item.gpa && <span style={styles.date}> · GPA: {item.gpa}</span>}
                </div>
                <span style={styles.date}>{item.startDate} – {item.endDate}</span>
              </div>
            )
          )}
        </div>
      );

    case "certifications":
      return (
        <div>
          {(c?.items ?? []).map(
            (item: { name: string; organization: string; date: string; url?: string }, i: number) => (
              <div key={i} style={{ ...styles.entryHeader, marginBottom: "4pt" }}>
                <span>
                  <strong>
                    {item.url ? (
                      <a href={item.url.startsWith("http") ? item.url : `https://${item.url}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                        {item.name}
                      </a>
                    ) : (
                      item.name
                    )}
                  </strong>
                  {item.organization ? ` — ${item.organization}` : ""}
                </span>
                <span style={styles.date}>{item.date}</span>
              </div>
            )
          )}
        </div>
      );

    default: {
      let text = c?.text || "";
      let items = Array.isArray(c?.items) ? c.items : [];
      if (typeof c === "string") {
        try {
          const parsed = JSON.parse(c);
          text = parsed.text || "";
          items = Array.isArray(parsed.items) ? parsed.items : [];
        } catch {
          text = c;
        }
      } else if (typeof text === "string" && text.startsWith("{")) {
        try {
          const parsed = JSON.parse(text);
          text = parsed.text || "";
          if (Array.isArray(parsed.items)) items = parsed.items;
        } catch {}
      }
      return (
        <div>
          {text && <p style={styles.bodyText}>{text}</p>}
          {items.length > 0 && (
            <ul style={styles.bullets}>
              {items.map((it: any, i: number) => (
                <li key={i}>{typeof it === "string" ? it : it.name || it.title || JSON.stringify(it)}</li>
              ))}
            </ul>
          )}
        </div>
      );
    }
  }
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "10pt",
    color: "#1a1a1a",
    background: "#fff",
    maxWidth: "800px",
    margin: "0 auto",
    lineHeight: 1.45,
  },
  header: { display: "flex", background: "#f8f9fe", borderBottom: `3px solid ${ACCENT}`, marginBottom: "0" },
  stripe: { width: "6pt", background: ACCENT, flexShrink: 0 },
  headerContent: { padding: "20pt 24pt 16pt" },
  name: { fontSize: "22pt", fontWeight: "bold", margin: 0, color: ACCENT, letterSpacing: "0.3pt" },
  contact: { fontSize: "9pt", color: "#555", marginTop: "4pt" },
  body: { padding: "16pt 24pt 24pt" },
  section: { marginBottom: "14pt" },
  sectionTitle: {
    fontSize: "11pt", fontWeight: "bold", color: ACCENT,
    borderBottom: `1.5px solid ${ACCENT}20`, paddingBottom: "3pt", marginBottom: "6pt", marginTop: 0,
  },
  bodyText: { margin: "0 0 3pt 0", color: "#333" },
  skillRow: { marginBottom: "3pt" },
  skillLabel: { fontWeight: "600", color: "#444" },
  entry: { marginBottom: "10pt" },
  entryHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  subtitle: { fontSize: "9pt", color: "#666", fontStyle: "italic", marginTop: "1pt" },
  date: { fontSize: "9pt", color: "#666", flexShrink: 0, marginLeft: "8pt" },
  bullets: { margin: "3pt 0 0 0", paddingLeft: "16pt", color: "#333" },
  techList: { fontSize: "9pt", color: "#666", marginLeft: "8pt" },
};

export function toHTML(cv: GeneratedCV, contact: { name: string; email?: string; phone?: string; city?: string; linkedinUrl?: string; websiteUrl?: string }): string {
  const contactLine = getContactHTML(contact, "#555");

  const sectionsHTML = cv.sections.map((s) => {
    const c = s.content;
    let body = "";

    if (s.type === "summary") body = `<p style="margin:0;color:#333">${c?.text ?? ""}</p>`;
    else if (s.type === "skills") {
      body = (c?.categories ?? []).map((cat: { name: string; skills: string[] }) =>
        `<div style="margin-bottom:2pt"><span style="font-weight:600">${cat.name}:</span> ${(cat.skills ?? []).join(", ")}</div>`
      ).join("");
    } else if (s.type === "experience") {
      body = (c?.items ?? []).map((item: { title: string; company: string; startDate: string; endDate: string; bullets: string[] }) =>
        `<div style="margin-bottom:10pt">
          <div style="display:flex;justify-content:space-between"><strong style="color:${ACCENT}">${item.title}</strong><span style="font-size:9pt;color:#666">${item.startDate} – ${item.endDate}</span></div>
          <div style="font-size:9pt;color:#666;font-style:italic">${item.company}</div>
          <ul style="margin:3pt 0 0;padding-left:16pt">${(item.bullets ?? []).map((b: string) => `<li>${b}</li>`).join("")}</ul>
        </div>`
      ).join("");
    } else if (s.type === "projects") {
      body = (c?.items ?? []).map((item: { name: string; description: string; techStack: string[]; impact?: string; bullets?: string[] }) => {
        const bulletsHTML = item.bullets && item.bullets.length > 0
          ? `<ul style="margin:3pt 0 0;padding-left:16pt">${item.bullets.map((b: string) => `<li>${b}</li>`).join("")}</ul>`
          : "";
        return `<div style="margin-bottom:8pt">
          <div style="display:flex;justify-content:space-between"><strong style="color:${ACCENT}">${item.name}</strong><span style="font-size:9pt;color:#666">${(item.techStack ?? []).join(", ")}</span></div>
          ${item.description ? `<p style="margin:2pt 0">${item.description}</p>` : ""}
          ${item.impact ? `<p style="margin:1pt 0;font-style:italic">Impact: ${item.impact}</p>` : ""}
          ${bulletsHTML}
        </div>`;
      }).join("");
    } else if (s.type === "education") {
      body = (c?.items ?? []).map((item: { degree: string; field: string; institution: string; startDate: string; endDate: string; gpa?: string }) =>
        `<div style="display:flex;justify-content:space-between;margin-bottom:6pt">
          <span><strong>${item.degree} in ${item.field}</strong> — ${item.institution}${item.gpa ? ` · GPA: ${item.gpa}` : ""}</span>
          <span style="font-size:9pt;color:#666">${item.startDate} – ${item.endDate}</span>
        </div>`
      ).join("");
    } else if (s.type === "certifications") {
      body = (c?.items ?? []).map((item: { name: string; organization: string; date: string; url?: string }) => {
        const fullUrl = item.url ? (item.url.startsWith("http") ? item.url : `https://${item.url}`) : "";
        const nameHTML = fullUrl
          ? `<a href="${fullUrl}" target="_blank" style="color:inherit;text-decoration:underline"><strong>${item.name}</strong></a>`
          : `<strong>${item.name}</strong>`;
        return `<div style="display:flex;justify-content:space-between;margin-bottom:4pt">
          <span>${nameHTML}${item.organization ? ` — ${item.organization}` : ""}</span>
          <span style="font-size:9pt;color:#666">${item.date}</span>
        </div>`;
      }).join("");
    } else {
      body = c?.text ? `<p style="margin:0 0 3pt 0;color:#333">${c.text}</p>` : "";
      if (Array.isArray(c?.items)) {
        body += `<ul style="margin:3pt 0 0;padding-left:16pt">${c.items.map((it: any) => `<li>${typeof it === "string" ? it : it.name || it.title || JSON.stringify(it)}</li>`).join("")}</ul>`;
      }
    }

    return `<div style="margin-bottom:14pt">
      <h2 style="font-size:11pt;font-weight:bold;color:${ACCENT};border-bottom:1.5px solid ${ACCENT}40;padding-bottom:3pt;margin:0 0 6pt 0">${s.title}</h2>
      ${body}
    </div>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <style>*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:10pt;color:#1a1a1a;margin:0;line-height:1.45}</style>
    </head><body>
    <div style="background:#f8f9fe;border-bottom:3px solid ${ACCENT};display:flex">
      <div style="width:6pt;background:${ACCENT};flex-shrink:0"></div>
      <div style="padding:20pt 24pt 16pt">
        <h1 style="font-size:22pt;font-weight:bold;margin:0;color:${ACCENT}">${contact.name}</h1>
        <div style="font-size:9pt;color:#555;margin-top:4pt">${contactLine}</div>
      </div>
    </div>
    <div style="padding:16pt 24pt 24pt">${sectionsHTML}</div>
  </body></html>`;
}
