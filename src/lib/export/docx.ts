import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ExternalHyperlink,
} from "docx";
import { saveAs } from "file-saver";
import { GeneratedCV, CVSection } from "@/types/cv";
import { TemplateContact } from "@/components/templates";

export async function exportDOCX(cv: GeneratedCV, contact: TemplateContact, filename: string): Promise<void> {
  const children: Paragraph[] = [];

  // --- Header ---
  children.push(
    new Paragraph({
      text: contact.name,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
  );
  const contactLine = [contact.email, contact.phone, contact.city, contact.linkedinUrl, contact.websiteUrl]
    .filter(Boolean)
    .join(" | ");
  children.push(
    new Paragraph({
      text: contactLine,
      alignment: AlignmentType.CENTER,
    }),
  );
  children.push(new Paragraph({ text: "" })); // spacer

  // --- Sections ---
  for (const section of cv.sections) {
    children.push(...buildSectionParagraphs(section));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 20 },
        },
      },
    },
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

function buildSectionParagraphs(section: CVSection): Paragraph[] {
  const out: Paragraph[] = [];
  const c = section.content;

  // Section heading
  out.push(
    new Paragraph({
      text: section.title.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1a1a1a", space: 1 } },
      spacing: { before: 180, after: 60 },
    }),
  );

  switch (section.type) {
    case "summary":
      out.push(new Paragraph({ text: c?.text ?? "" }));
      break;

    case "skills":
      for (const cat of c?.categories ?? []) {
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${cat.name}: `, bold: true }),
              new TextRun({ text: (cat.skills ?? []).join(", ") }),
            ],
            spacing: { after: 40 },
          }),
        );
      }
      if (!c?.categories && Array.isArray(c?.skills)) {
        out.push(new Paragraph({ text: (c.skills as string[]).join(", ") }));
      }
      break;

    case "experience":
      for (const item of c?.items ?? []) {
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.title, bold: true }),
              new TextRun({ text: `  ${item.startDate} – ${item.endDate}`, color: "666666" }),
            ],
            spacing: { before: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: item.company, italics: true, color: "555555" })],
            spacing: { after: 40 },
          }),
        );
        for (const bullet of item.bullets ?? []) {
          out.push(
            new Paragraph({
              text: bullet,
              bullet: { level: 0 },
              spacing: { after: 20 },
            }),
          );
        }
      }
      break;

    case "projects":
      for (const item of c?.items ?? []) {
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.name, bold: true }),
              new TextRun({ text: `  ${(item.techStack ?? []).join(", ")}`, color: "666666" }),
            ],
            spacing: { before: 120 },
          }),
          new Paragraph({ text: item.description ?? "", spacing: { after: 40 } }),
        );
        if (item.impact) {
          out.push(
            new Paragraph({
              children: [new TextRun({ text: `Impact: ${item.impact}`, italics: true })],
              spacing: { after: 60 },
            }),
          );
        }
      }
      break;

    case "education":
      for (const item of c?.items ?? []) {
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${item.degree} in ${item.field}`, bold: true }),
              new TextRun({ text: ` — ${item.institution}`, color: "555555" }),
              new TextRun({ text: `  ${item.startDate} – ${item.endDate}`, color: "666666" }),
            ],
            spacing: { before: 80, after: 40 },
          }),
        );
      }
      break;

    case "certifications":
      for (const item of c?.items ?? []) {
        const fullUrl = item.url ? (item.url.startsWith("http") ? item.url : `https://${item.url}`) : "";
        const nameRun = new TextRun({ text: item.name, bold: true });
        const nameChild = fullUrl
          ? new ExternalHyperlink({
              children: [new TextRun({ text: item.name, bold: true, style: "Hyperlink" })],
              link: fullUrl,
            })
          : nameRun;

        out.push(
          new Paragraph({
            children: [
              nameChild,
              new TextRun({ text: `${item.organization ? ` — ${item.organization}` : ""}  ${item.date || ""}`, color: "666666" }),
            ],
            spacing: { before: 60, after: 20 },
          }),
        );
      }
      break;

    default:
      if (c?.text) {
        out.push(new Paragraph({ text: c.text, spacing: { after: 40 } }));
      }
      if (Array.isArray(c?.items)) {
        for (const it of c.items) {
          const textStr = typeof it === "string" ? it : it.name || it.title || JSON.stringify(it);
          out.push(new Paragraph({ text: textStr, bullet: { level: 0 }, spacing: { after: 20 } }));
        }
      }
      break;
  }

  return out;
}
