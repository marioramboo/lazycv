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

const ACCENT = "#1a2e52"; // navy
const GOLD = "#b8972e";

import { ContactLinks, getContactHTML } from ".";

export function ExecutiveTemplate({ cv, name, email, phone, city, linkedinUrl, websiteUrl }: TemplateProps) {

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.name}>{name}</h1>
        <div style={styles.goldLine} />
        <div style={styles.contact}>
          <ContactLinks contact={{ name, email, phone, city, linkedinUrl, websiteUrl }} color="#555" />
        </div>
      </div>

      {cv.sections.map((section) => (
        <div key={section.id} style={styles.section}>
          <div style={styles.sectionTitleRow}>
            <div style={styles.sectionAccentBar} />
            <h2 style={styles.sectionTitle}>{section.title.toUpperCase()}</h2>
          </div>
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
      return <p style={styles.summaryText}>{c?.text}</p>;

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
                  <strong style={styles.entryTitle}>{item.title}</strong>
                  <span style={styles.date}>{item.startDate} – {item.endDate}</span>
                </div>
                <div style={styles.subtitle}>{item.company}</div>
                <ul style={styles.bullets}>
                  {(item.bullets ?? []).map((b: string, j: number) => <li key={j} style={styles.bullet}>{b}</li>)}
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
                  <strong style={styles.entryTitle}>{item.name}</strong>
                  <span style={styles.techList}>{(item.techStack ?? []).join(", ")}</span>
                </div>
                {item.description && <p style={styles.bodyText}>{item.description}</p>}
                {item.impact && <p style={{ ...styles.bodyText, fontWeight: "600" }}>Result: {item.impact}</p>}
                {item.bullets && item.bullets.length > 0 && (
                  <ul style={styles.bullets}>
                    {item.bullets.map((b: string, j: number) => (
                      <li key={j} style={styles.bullet}>{b}</li>
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
              <div key={i} style={{ ...styles.entryHeader, marginBottom: "8pt" }}>
                <div>
                  <strong style={styles.entryTitle}>{item.degree} in {item.field}</strong>
                  <div style={styles.subtitle}>{item.institution}{item.gpa ? ` · GPA: ${item.gpa}` : ""}</div>
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
              <div key={i} style={{ ...styles.entryHeader, marginBottom: "5pt" }}>
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
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "10pt",
    color: "#1a1a1a",
    background: "#fff",
    padding: "40pt 52pt",
    maxWidth: "800px",
    margin: "0 auto",
    lineHeight: 1.5,
  },
  header: { textAlign: "center", marginBottom: "20pt" },
  name: {
    fontSize: "26pt", fontWeight: "bold", margin: "0 0 10pt 0",
    color: ACCENT, letterSpacing: "2pt", textTransform: "uppercase",
  },
  goldLine: { height: "2px", background: GOLD, margin: "0 auto 8pt", width: "60%" },
  contact: { fontSize: "9pt", color: "#555", letterSpacing: "0.3pt" },
  section: { marginBottom: "18pt" },
  sectionTitleRow: { display: "flex", alignItems: "center", gap: "8pt", marginBottom: "8pt" },
  sectionAccentBar: { width: "4pt", height: "14pt", background: GOLD, flexShrink: 0 },
  sectionTitle: {
    fontSize: "10pt", fontWeight: "bold", color: ACCENT,
    letterSpacing: "2pt", margin: 0,
  },
  summaryText: {
    margin: "0", color: "#333", fontStyle: "italic",
    fontSize: "10.5pt", lineHeight: 1.6,
  },
  bodyText: { margin: "0 0 3pt 0", color: "#333", fontFamily: "Arial, Helvetica, sans-serif" },
  skillRow: { marginBottom: "3pt", fontFamily: "Arial, Helvetica, sans-serif", fontSize: "9.5pt" },
  skillLabel: { fontWeight: "700", color: ACCENT },
  entry: { marginBottom: "12pt" },
  entryHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  entryTitle: { fontSize: "10.5pt", color: ACCENT },
  subtitle: { fontSize: "9pt", color: "#666", fontStyle: "italic", marginTop: "2pt" },
  date: { fontSize: "9pt", color: "#777", flexShrink: 0, marginLeft: "8pt" },
  bullets: { margin: "4pt 0 0 0", paddingLeft: "16pt" },
  bullet: { color: "#333", marginBottom: "2pt", fontFamily: "Arial, Helvetica, sans-serif", fontSize: "9.5pt" },
  techList: { fontSize: "9pt", color: "#666", marginLeft: "8pt" },
};

export function toHTML(cv: GeneratedCV, contact: { name: string; email?: string; phone?: string; city?: string; linkedinUrl?: string; websiteUrl?: string }): string {
  const contactLine = getContactHTML(contact, "#555");

  const sectionsHTML = cv.sections.map((s) => {
    const c = s.content;
    let body = "";

    if (s.type === "summary") body = `<p style="margin:0;color:#333;font-style:italic;font-size:10.5pt;line-height:1.6">${c?.text ?? ""}</p>`;
    else if (s.type === "skills") {
      body = `<div style="font-family:Arial,sans-serif;font-size:9.5pt">${(c?.categories ?? []).map((cat: { name: string; skills: string[] }) =>
        `<div style="margin-bottom:2pt"><span style="font-weight:700;color:${ACCENT}">${cat.name}:</span> ${(cat.skills ?? []).join(", ")}</div>`
      ).join("")}</div>`;
    } else if (s.type === "experience") {
      body = (c?.items ?? []).map((item: { title: string; company: string; startDate: string; endDate: string; bullets: string[] }) =>
        `<div style="margin-bottom:12pt">
          <div style="display:flex;justify-content:space-between"><strong style="font-size:10.5pt;color:${ACCENT}">${item.title}</strong><span style="font-size:9pt;color:#777">${item.startDate} – ${item.endDate}</span></div>
          <div style="font-size:9pt;color:#666;font-style:italic">${item.company}</div>
          <ul style="margin:4pt 0 0;padding-left:16pt;font-family:Arial,sans-serif;font-size:9.5pt">${(item.bullets ?? []).map((b: string) => `<li style="margin-bottom:2pt">${b}</li>`).join("")}</ul>
        </div>`
      ).join("");
    } else if (s.type === "projects") {
      body = (c?.items ?? []).map((item: { name: string; description: string; techStack: string[]; impact?: string; bullets?: string[] }) => {
        const bulletsHTML = item.bullets && item.bullets.length > 0
          ? `<ul style="margin:4pt 0 0;padding-left:16pt;font-family:Arial,sans-serif;font-size:9.5pt">${item.bullets.map((b: string) => `<li style="margin-bottom:2pt">${b}</li>`).join("")}</ul>`
          : "";
        return `<div style="margin-bottom:10pt">
          <div style="display:flex;justify-content:space-between"><strong style="color:${ACCENT}">${item.name}</strong><span style="font-size:9pt;color:#666">${(item.techStack ?? []).join(", ")}</span></div>
          ${item.description ? `<p style="margin:2pt 0;font-family:Arial,sans-serif">${item.description}</p>` : ""}
          ${item.impact ? `<p style="margin:1pt 0;font-weight:600;font-family:Arial,sans-serif">Result: ${item.impact}</p>` : ""}
          ${bulletsHTML}
        </div>`;
      }).join("");
    } else if (s.type === "education") {
      body = (c?.items ?? []).map((item: { degree: string; field: string; institution: string; startDate: string; endDate: string; gpa?: string }) =>
        `<div style="display:flex;justify-content:space-between;margin-bottom:8pt">
          <div><strong style="color:${ACCENT}">${item.degree} in ${item.field}</strong><div style="font-size:9pt;color:#666;font-style:italic">${item.institution}${item.gpa ? ` · GPA: ${item.gpa}` : ""}</div></div>
          <span style="font-size:9pt;color:#777">${item.startDate} – ${item.endDate}</span>
        </div>`
      ).join("");
    } else if (s.type === "certifications") {
      body = (c?.items ?? []).map((item: { name: string; organization: string; date: string; url?: string }) => {
        const fullUrl = item.url ? (item.url.startsWith("http") ? item.url : `https://${item.url}`) : "";
        const nameHTML = fullUrl
          ? `<a href="${fullUrl}" target="_blank" style="color:inherit;text-decoration:underline"><strong>${item.name}</strong></a>`
          : `<strong>${item.name}</strong>`;
        return `<div style="display:flex;justify-content:space-between;margin-bottom:5pt">
          <span>${nameHTML}${item.organization ? ` — ${item.organization}` : ""}</span>
          <span style="font-size:9pt;color:#777">${item.date}</span>
        </div>`;
      }).join("");
    } else {
      body = c?.text ? `<p style="margin:0;color:#333;font-family:Arial,sans-serif">${c.text}</p>` : "";
      if (Array.isArray(c?.items)) {
        body += `<ul style="margin:4pt 0 0;padding-left:16pt;font-family:Arial,sans-serif;font-size:9.5pt">${c.items.map((it: any) => `<li style="margin-bottom:2pt">${typeof it === "string" ? it : it.name || it.title || JSON.stringify(it)}</li>`).join("")}</ul>`;
      }
    }

    return `<div style="margin-bottom:18pt">
      <div style="display:flex;align-items:center;gap:8pt;margin-bottom:8pt">
        <div style="width:4pt;height:14pt;background:${GOLD};flex-shrink:0"></div>
        <h2 style="font-size:10pt;font-weight:bold;color:${ACCENT};letter-spacing:2pt;margin:0">${s.title.toUpperCase()}</h2>
      </div>
      ${body}
    </div>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <style>*{box-sizing:border-box}body{font-family:Georgia,'Times New Roman',serif;font-size:10pt;color:#1a1a1a;margin:0;padding:40pt 52pt;line-height:1.5}</style>
    </head><body>
    <div style="text-align:center;margin-bottom:20pt">
      <h1 style="font-size:26pt;font-weight:bold;margin:0 0 10pt 0;color:${ACCENT};letter-spacing:2pt;text-transform:uppercase">${contact.name}</h1>
      <div style="height:2px;background:${GOLD};margin:0 auto 8pt;width:60%"></div>
      <div style="font-size:9pt;color:#555;letter-spacing:0.3pt">${contactLine}</div>
    </div>
    ${sectionsHTML}
  </body></html>`;
}
