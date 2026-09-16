/**
 * Client-side PDF export using jsPDF directly.
 *
 * Renders the CV data structure to PDF using jsPDF's text/line primitives.
 * This avoids html2canvas entirely — no freezing, instant download.
 */
import { jsPDF } from "jspdf";
import type { GeneratedCV, CoverLetter } from "@/types/cv";

interface Contact {
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

// --- Page constants (A4 in pt) ---
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_L = 50;
const MARGIN_R = 50;
const MARGIN_TOP = 44;
const MARGIN_BOTTOM = 44;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;
const MAX_Y = PAGE_H - MARGIN_BOTTOM;

// --- Font sizes ---
const NAME_SIZE = 20;
const CONTACT_SIZE = 8.5;
const SECTION_TITLE_SIZE = 10;
const BODY_SIZE = 9;
const SMALL_SIZE = 8;

// --- Line heights (multiplied by font size to get spacing) ---
const LINE_H = 1.35; // line-height multiplier for body text

// --- Colors ---
const BLACK = "#111111";
const DARK = "#222222";
const BODY_COLOR = "#333333";
const MUTED = "#666666";
const RULE_COLOR = "#222222";

/**
 * Export CV as a direct-download PDF. No popups, no print dialog.
 */
export async function exportPDF(
  cv: GeneratedCV,
  contact: Contact,
  filename: string
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const ctx = new RenderContext(doc);

  // ── Header ──
  ctx.renderHeader(contact);

  // ── Sections ──
  for (const section of cv.sections) {
    if (!section.content) continue;
    ctx.renderSection(section);
  }

  doc.save(filename);
}

/** Encapsulates layout state and rendering logic */
class RenderContext {
  y: number = MARGIN_TOP;
  doc: jsPDF;

  constructor(doc: jsPDF) {
    this.doc = doc;
  }

  /** Add a new page if needed and return true if a page was added */
  ensureSpace(needed: number): boolean {
    if (this.y + needed > MAX_Y) {
      this.doc.addPage();
      this.y = MARGIN_TOP;
      return true;
    }
    return false;
  }

  /** Move y cursor down */
  advance(pts: number) {
    this.y += pts;
  }

  /** Line height for a given font size */
  lh(fontSize: number) {
    return fontSize * LINE_H;
  }

  /** Draw wrapped text and advance y. Returns the number of lines drawn. */
  drawWrapped(
    text: string,
    x: number,
    maxWidth: number,
    fontSize: number,
    font: "normal" | "bold" | "italic" | "bolditalic" = "normal",
    color: string = BODY_COLOR
  ): number {
    this.doc.setFont("helvetica", font);
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(color);
    const lines: string[] = this.doc.splitTextToSize(text, maxWidth);
    const lineH = this.lh(fontSize);
    for (const line of lines) {
      this.ensureSpace(lineH);
      this.doc.text(line, x, this.y);
      this.y += lineH;
    }
    return lines.length;
  }

  /** Draw text at a position without advancing y */
  drawText(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    font: "normal" | "bold" | "italic" | "bolditalic" = "normal",
    color: string = BODY_COLOR,
    align: "left" | "center" | "right" = "left"
  ) {
    this.doc.setFont("helvetica", font);
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(color);
    this.doc.text(text, x, y, { align });
  }

  // ── Header ──
  renderHeader(contact: Contact) {
    // Name
    this.drawText(
      contact.name || "Your Name",
      PAGE_W / 2,
      this.y,
      NAME_SIZE,
      "bold",
      BLACK,
      "center"
    );
    this.y += NAME_SIZE + 6;

    // Contact info
    const parts: string[] = [];
    if (contact.email) parts.push(contact.email);
    if (contact.phone) parts.push(contact.phone);
    if (contact.city) parts.push(contact.city);
    if (contact.linkedinUrl)
      parts.push(
        contact.linkedinUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
      );
    if (contact.websiteUrl)
      parts.push(
        contact.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
      );

    if (parts.length > 0) {
      const contactLine = parts.join("  ·  ");
      this.drawText(
        contactLine,
        PAGE_W / 2,
        this.y,
        CONTACT_SIZE,
        "normal",
        MUTED,
        "center"
      );

      // Embed clickable link for linkedin
      if (contact.linkedinUrl) {
        const fullUrl = contact.linkedinUrl.startsWith("http")
          ? contact.linkedinUrl
          : `https://${contact.linkedinUrl}`;
        const display = contact.linkedinUrl
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "");
        this.addLinkInLine(contactLine, display, fullUrl, CONTACT_SIZE);
      }

      this.y += CONTACT_SIZE + 4;
    }

    // Thin separator line under header
    this.y += 4;
    this.doc.setDrawColor("#cccccc");
    this.doc.setLineWidth(0.4);
    this.doc.line(MARGIN_L + 40, this.y, PAGE_W - MARGIN_R - 40, this.y);
    this.y += 14;
  }

  /** Make a substring in a centered line into a clickable link */
  private addLinkInLine(
    fullLine: string,
    substring: string,
    url: string,
    fontSize: number
  ) {
    this.doc.setFontSize(fontSize);
    const idx = fullLine.indexOf(substring);
    if (idx < 0) return;
    const fullW = this.doc.getTextWidth(fullLine);
    const beforeW = this.doc.getTextWidth(fullLine.substring(0, idx));
    const linkW = this.doc.getTextWidth(substring);
    const lineX = PAGE_W / 2 - fullW / 2;
    this.doc.link(lineX + beforeW, this.y - fontSize, linkW, fontSize + 2, {
      url,
    });
  }

  // ── Section header ──
  renderSectionTitle(title: string) {
    this.ensureSpace(22);
    this.drawText(title.toUpperCase(), MARGIN_L, this.y, SECTION_TITLE_SIZE, "bold", BLACK);
    this.y += 4;
    this.doc.setDrawColor(RULE_COLOR);
    this.doc.setLineWidth(0.6);
    this.doc.line(MARGIN_L, this.y, PAGE_W - MARGIN_R, this.y);
    this.y += 10;
  }

  // ── Section dispatcher ──
  renderSection(section: { type: string; title: string; content: any }) {
    this.renderSectionTitle(section.title);
    const c = section.content;

    switch (section.type) {
      case "summary":
        this.renderSummary(c);
        break;
      case "skills":
        this.renderSkills(c);
        break;
      case "experience":
        this.renderExperience(c);
        break;
      case "projects":
        this.renderProjects(c);
        break;
      case "education":
        this.renderEducation(c);
        break;
      case "certifications":
        this.renderCertifications(c);
        break;
      default:
        this.renderCustomSection(c);
        break;
    }

    this.y += 6;
  }

  // ── Summary ──
  renderSummary(c: any) {
    if (!c?.text) return;
    this.drawWrapped(c.text, MARGIN_L, CONTENT_W, BODY_SIZE, "normal", BODY_COLOR);
    this.y += 2;
  }

  // ── Skills ──
  renderSkills(c: any) {
    if (c?.categories && Array.isArray(c.categories)) {
      for (const cat of c.categories) {
        this.ensureSpace(this.lh(BODY_SIZE));
        const label = `${cat.name}: `;

        // Measure label width
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(BODY_SIZE);
        const labelW = this.doc.getTextWidth(label);

        // Draw label
        this.doc.setTextColor(DARK);
        this.doc.text(label, MARGIN_L, this.y);

        // Draw skills text wrapping after the label
        const skillText = (cat.skills || []).join(", ");
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(BODY_COLOR);
        const availW = CONTENT_W - labelW;
        const lines: string[] = this.doc.splitTextToSize(skillText, availW);
        const lh = this.lh(BODY_SIZE);

        if (lines.length > 0) {
          // First line beside the label
          this.doc.text(lines[0], MARGIN_L + labelW, this.y);
          this.y += lh;

          // Continuation lines at full width (start at margin)
          for (let i = 1; i < lines.length; i++) {
            this.ensureSpace(lh);
            // Re-wrap continuation at full content width
            this.doc.text(lines[i], MARGIN_L + labelW, this.y);
            this.y += lh;
          }
        } else {
          this.y += lh;
        }

        this.y += 1; // tiny gap between categories
      }
    } else if (Array.isArray(c?.skills)) {
      this.drawWrapped(
        (c.skills as string[]).join(", "),
        MARGIN_L,
        CONTENT_W,
        BODY_SIZE
      );
    }
  }

  // ── Experience ──
  renderExperience(c: any) {
    const items = c?.items ?? [];
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      this.ensureSpace(36);

      // Row 1: Title (left) + Dates (right)
      const dateStr = `${item.startDate || ""} – ${item.endDate || ""}`;
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(SMALL_SIZE);

      this.drawText(item.title || "", MARGIN_L, this.y, BODY_SIZE, "bold", BLACK);
      this.drawText(
        dateStr,
        PAGE_W - MARGIN_R,
        this.y,
        SMALL_SIZE,
        "normal",
        MUTED,
        "right"
      );
      this.y += this.lh(BODY_SIZE);

      // Row 2: Company
      this.drawText(item.company || "", MARGIN_L, this.y, SMALL_SIZE, "italic", MUTED);
      this.y += this.lh(SMALL_SIZE) + 2;

      // Bullets
      this.renderBullets(item.bullets ?? []);

      // Spacing between entries (less after last)
      if (idx < items.length - 1) this.y += 6;
    }
  }

  // ── Projects ──
  renderProjects(c: any) {
    const items = c?.items ?? [];
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      this.ensureSpace(28);

      // Row 1: Project name
      this.drawText(item.name || "", MARGIN_L, this.y, BODY_SIZE, "bold", BLACK);

      // Tech stack — on same line if it fits, otherwise next line
      if (item.techStack?.length) {
        const techStr = item.techStack.join(", ");
        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(SMALL_SIZE);
        const techW = this.doc.getTextWidth(techStr);
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(BODY_SIZE);
        const nameW = this.doc.getTextWidth(item.name || "");
        const gap = 12;

        if (nameW + gap + techW < CONTENT_W) {
          // Fits on same line → right-align
          this.drawText(
            techStr,
            PAGE_W - MARGIN_R,
            this.y,
            SMALL_SIZE,
            "normal",
            MUTED,
            "right"
          );
        } else {
          // Wrap to next line
          this.y += this.lh(BODY_SIZE);
          this.drawText(techStr, MARGIN_L, this.y, SMALL_SIZE, "italic", MUTED);
        }
      }
      this.y += this.lh(BODY_SIZE);

      // Description
      if (item.description) {
        this.drawWrapped(item.description, MARGIN_L, CONTENT_W, BODY_SIZE, "normal", BODY_COLOR);
      }

      // Impact
      if (item.impact) {
        this.ensureSpace(this.lh(BODY_SIZE));
        this.drawWrapped(
          `Impact: ${item.impact}`,
          MARGIN_L,
          CONTENT_W,
          BODY_SIZE,
          "italic",
          BODY_COLOR
        );
      }

      // Bullets
      if (item.bullets?.length) {
        this.renderBullets(item.bullets);
      }

      if (idx < items.length - 1) this.y += 6;
    }
  }

  // ── Shared bullet renderer ──
  private renderBullets(bullets: string[]) {
    const bulletIndent = 10;
    const textIndent = 18;
    const textW = CONTENT_W - textIndent;

    for (const bullet of bullets) {
      const lh = this.lh(BODY_SIZE);
      this.ensureSpace(lh);

      // Bullet dot
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(BODY_SIZE);
      this.doc.setTextColor(BODY_COLOR);
      this.doc.text("•", MARGIN_L + bulletIndent, this.y);

      // Text (may wrap)
      const lines: string[] = this.doc.splitTextToSize(bullet, textW);
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) {
          this.y += lh;
          this.ensureSpace(lh);
        }
        this.doc.text(lines[i], MARGIN_L + textIndent, this.y);
      }
      this.y += lh;
    }
  }

  // ── Education ──
  renderEducation(c: any) {
    const items = c?.items ?? [];
    for (const item of items) {
      this.ensureSpace(22);

      // Degree line
      let degreeText = "";
      if (item.degree && item.field) {
        degreeText = `${item.degree} in ${item.field}`;
      } else {
        degreeText = item.degree || item.field || "";
      }
      if (item.institution) degreeText += ` — ${item.institution}`;
      if (item.gpa) degreeText += `  (GPA: ${item.gpa})`;

      // Measure to avoid overlap with dates
      const dateStr = `${item.startDate || ""} – ${item.endDate || ""}`;
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(SMALL_SIZE);
      const dateW = this.doc.getTextWidth(dateStr) + 8;

      // Draw degree (capped width so it doesn't overlap dates)
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(BODY_SIZE);
      this.doc.setTextColor(BLACK);
      const degreeLines = this.doc.splitTextToSize(degreeText, CONTENT_W - dateW);
      this.doc.text(degreeLines[0] || "", MARGIN_L, this.y);

      // Dates
      this.drawText(dateStr, PAGE_W - MARGIN_R, this.y, SMALL_SIZE, "normal", MUTED, "right");

      this.y += this.lh(BODY_SIZE);

      // Extra lines of degree text if wrapped
      for (let i = 1; i < degreeLines.length; i++) {
        this.doc.text(degreeLines[i], MARGIN_L, this.y);
        this.y += this.lh(BODY_SIZE);
      }

      this.y += 4;
    }
  }

  // ── Certifications ──
  renderCertifications(c: any) {
    const items = c?.items ?? [];
    for (const item of items) {
      this.ensureSpace(16);

      const dateStr = item.date || "";
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(SMALL_SIZE);

      // Cert name + org
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(BODY_SIZE);
      this.doc.setTextColor(BLACK);

      const nameText = item.name || "";
      this.doc.text(nameText, MARGIN_L, this.y);
      const nameW = this.doc.getTextWidth(nameText);

      if (item.url) {
        const fullUrl = item.url.startsWith("http") ? item.url : `https://${item.url}`;
        this.doc.link(MARGIN_L, this.y - BODY_SIZE, nameW, BODY_SIZE + 2, { url: fullUrl });
      }

      if (item.organization) {
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(BODY_COLOR);
        this.doc.text(` — ${item.organization}`, MARGIN_L + nameW, this.y);
      }

      // Date
      if (dateStr) {
        this.drawText(dateStr, PAGE_W - MARGIN_R, this.y, SMALL_SIZE, "normal", MUTED, "right");
      }

      this.y += this.lh(BODY_SIZE) + 3;
    }
  }

  // ── Custom / Other Section ──
  renderCustomSection(c: any) {
    if (c?.text) {
      this.drawWrapped(c.text, MARGIN_L, CONTENT_W, BODY_SIZE, "normal", BODY_COLOR);
    }
    if (Array.isArray(c?.items)) {
      this.renderBullets(c.items.map((it: any) => (typeof it === "string" ? it : it.name || it.title || JSON.stringify(it))));
    }
  }
}

/**
 * Export Cover Letter as a direct-download PDF using jsPDF.
 */
export async function exportCoverLetterPDF(
  coverLetter: CoverLetter,
  contact: Contact,
  filename: string
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });

  let y = 50;

  // Header: Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor("#111111");
  doc.text(contact.name || "Your Name", 50, y);
  y += 24;

  // Header: Contact Info
  const parts: string[] = [];
  if (contact.email) parts.push(contact.email);
  if (contact.phone) parts.push(contact.phone);
  if (contact.city) parts.push(contact.city);
  if (contact.linkedinUrl) parts.push(contact.linkedinUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""));

  if (parts.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#555555");
    doc.text(parts.join("  ·  "), 50, y);
    y += 16;
  }

  // Thin Rule
  doc.setDrawColor("#cccccc");
  doc.setLineWidth(0.5);
  doc.line(50, y, 595.28 - 50, y);
  y += 26;

  // Subject line
  if (coverLetter.jobTitle) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor("#111111");
    doc.text(`Re: ${coverLetter.jobTitle} position at ${coverLetter.companyName || 'the company'}`, 50, y);
    y += 24;
  }

  // Cover Letter Paragraphs
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor("#222222");

  const lineH = 9.5 * 1.5;
  const maxWidth = 595.28 - 100;

  const paragraphs = coverLetter.content.split(/\n\n+/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    const lines: string[] = doc.splitTextToSize(trimmed, maxWidth);
    for (const line of lines) {
      if (y + lineH > 841.89 - 50) {
        doc.addPage();
        y = 50;
      }
      doc.text(line, 50, y);
      y += lineH;
    }
    y += 12; // Gap between paragraphs
  }

  // Sign-off
  if (y + 40 > 841.89 - 50) {
    doc.addPage();
    y = 50;
  }
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.text("Sincerely,", 50, y);
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.text(contact.name || "Your Name", 50, y);

  doc.save(filename);
}
