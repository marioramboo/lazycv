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

import { ContactLinks, getContactHTML } from ".";

export function ClassicTemplate({ cv, name, email, phone, city, linkedinUrl, websiteUrl }: TemplateProps) {
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.name}>{name}</h1>
        <div style={styles.contact}>
          <ContactLinks contact={{ name, email, phone, city, linkedinUrl, websiteUrl }} color="#444" />
        </div>
      </div>

      {cv.sections.map((section) => (
        <div key={section.id} style={styles.section}>
          <h2 style={styles.sectionTitle}>{section.title.toUpperCase()}</h2>
          <hr style={styles.rule} />
          <SectionBody section={section} />
        </div>
      ))}
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
              <strong>{cat.name}:</strong> {(cat.skills ?? []).join(", ")}
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
                  <strong>{item.title}</strong>
                  <span style={styles.date}>{item.startDate} – {item.endDate}</span>
                </div>
                <div style={styles.entrySubtitle}>{item.company}</div>
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
                  <strong>{item.name}</strong>
                  {item.techStack?.length > 0 && (
                    <span style={styles.techList}>{item.techStack.join(", ")}</span>
                  )}
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
              <div key={i} style={styles.entryHeader}>
                <div>
                  <strong>{item.degree} in {item.field}</strong> — {item.institution}
                  {item.gpa && <span> (GPA: {item.gpa})</span>}
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
              <div key={i} style={styles.entryHeader}>
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
    padding: "36pt 48pt",
    maxWidth: "800px",
    margin: "0 auto",
    lineHeight: 1.4,
  },
  header: { textAlign: "center", marginBottom: "16pt" },
  name: { fontSize: "20pt", fontWeight: "bold", margin: 0, letterSpacing: "0.5pt" },
  contact: { fontSize: "9pt", color: "#444", marginTop: "4pt" },
  section: { marginBottom: "12pt" },
  sectionTitle: {
    fontSize: "10pt", fontWeight: "bold", letterSpacing: "1.5pt",
    margin: "0 0 2pt 0", color: "#1a1a1a",
  },
  rule: { border: "none", borderTop: "1px solid #1a1a1a", margin: "2pt 0 6pt 0" },
  bodyText: { margin: "0 0 4pt 0", color: "#333" },
  skillRow: { marginBottom: "2pt", color: "#333" },
  entry: { marginBottom: "8pt" },
  entryHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  entrySubtitle: { fontSize: "9pt", color: "#555", fontStyle: "italic", marginTop: "1pt" },
  date: { fontSize: "9pt", color: "#666", flexShrink: 0, marginLeft: "8pt" },
  bullets: { margin: "3pt 0 0 0", paddingLeft: "16pt", color: "#333" },
  techList: { fontSize: "9pt", color: "#555", marginLeft: "8pt" },
};

export function toHTML(cv: GeneratedCV, contact: { name: string; email?: string; phone?: string; city?: string; linkedinUrl?: string; websiteUrl?: string }): string {
  const contactLine = getContactHTML(contact, "#444");

  const sectionsHTML = cv.sections.map((s) => {
    const c = s.content;
    let body = "";

    if (s.type === "summary") {
      body = `<p style="margin:0 0 4pt 0;color:#333">${c?.text ?? ""}</p>`;
    } else if (s.type === "skills") {
      body = (c?.categories ?? []).map((cat: { name: string; skills: string[] }) =>
        `<div style="margin-bottom:2pt"><strong>${cat.name}:</strong> ${(cat.skills ?? []).join(", ")}</div>`
      ).join("");
      if (!c?.categories && Array.isArray(c?.skills)) body = `<p>${(c.skills as string[]).join(", ")}</p>`;
    } else if (s.type === "experience") {
      body = (c?.items ?? []).map((item: { title: string; company: string; startDate: string; endDate: string; bullets: string[] }) =>
        `<div style="margin-bottom:8pt">
          <div style="display:flex;justify-content:space-between"><strong>${item.title}</strong><span style="font-size:9pt;color:#666">${item.startDate} – ${item.endDate}</span></div>
          <div style="font-size:9pt;color:#555;font-style:italic">${item.company}</div>
          <ul style="margin:3pt 0 0;padding-left:16pt">${(item.bullets ?? []).map((b: string) => `<li>${b}</li>`).join("")}</ul>
        </div>`
      ).join("");
    } else if (s.type === "projects") {
      body = (c?.items ?? []).map((item: { name: string; description: string; techStack: string[]; impact?: string; bullets?: string[] }) => {
        const bulletsHTML = item.bullets && item.bullets.length > 0
          ? `<ul style="margin:3pt 0 0;padding-left:16pt">${item.bullets.map((b: string) => `<li>${b}</li>`).join("")}</ul>`
          : "";
        return `<div style="margin-bottom:8pt">
          <div style="display:flex;justify-content:space-between"><strong>${item.name}</strong><span style="font-size:9pt;color:#555">${(item.techStack ?? []).join(", ")}</span></div>
          ${item.description ? `<p style="margin:2pt 0">${item.description}</p>` : ""}
          ${item.impact ? `<p style="margin:1pt 0;font-style:italic">Impact: ${item.impact}</p>` : ""}
          ${bulletsHTML}
        </div>`;
      }).join("");
    } else if (s.type === "education") {
      body = (c?.items ?? []).map((item: { degree: string; field: string; institution: string; startDate: string; endDate: string; gpa?: string }) =>
        `<div style="display:flex;justify-content:space-between">
          <span><strong>${item.degree} in ${item.field}</strong> — ${item.institution}${item.gpa ? ` (GPA: ${item.gpa})` : ""}</span>
          <span style="font-size:9pt;color:#666">${item.startDate} – ${item.endDate}</span>
        </div>`
      ).join("");
    } else if (s.type === "certifications") {
      body = (c?.items ?? []).map((item: { name: string; organization: string; date: string; url?: string }) => {
        const fullUrl = item.url ? (item.url.startsWith("http") ? item.url : `https://${item.url}`) : "";
        const nameHTML = fullUrl
          ? `<a href="${fullUrl}" target="_blank" style="color:inherit;text-decoration:underline"><strong>${item.name}</strong></a>`
          : `<strong>${item.name}</strong>`;
        return `<div style="display:flex;justify-content:space-between">
          <span>${nameHTML}${item.organization ? ` — ${item.organization}` : ""}</span>
          <span style="font-size:9pt;color:#666">${item.date}</span>
        </div>`;
      }).join("");
    } else {
      body = c?.text ? `<p style="margin:0 0 4pt 0;color:#333">${c.text}</p>` : "";
      if (Array.isArray(c?.items)) {
        body += `<ul style="margin:3pt 0 0;padding-left:16pt">${c.items.map((it: any) => `<li>${typeof it === "string" ? it : it.name || it.title || JSON.stringify(it)}</li>`).join("")}</ul>`;
      }
    }

    return `<div style="margin-bottom:12pt">
      <h2 style="font-size:10pt;font-weight:bold;letter-spacing:1.5pt;margin:0 0 2pt 0">${s.title.toUpperCase()}</h2>
      <hr style="border:none;border-top:1px solid #1a1a1a;margin:2pt 0 6pt 0"/>
      ${body}
    </div>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <style>*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:10pt;color:#1a1a1a;margin:0;padding:36pt 48pt;line-height:1.4}</style>
    </head><body>
    <div style="text-align:center;margin-bottom:16pt">
      <h1 style="font-size:20pt;font-weight:bold;margin:0;letter-spacing:0.5pt">${contact.name}</h1>
      <div style="font-size:9pt;color:#444;margin-top:4pt">${contactLine}</div>
    </div>
    ${sectionsHTML}
  </body></html>`;
}
