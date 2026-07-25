import { AlignmentType, Document, HeadingLevel, Paragraph, TextRun } from "docx";
import { ResumeData } from "@/types/resume";
import { getResumeSectionOrder, ResumeSectionKey } from "@/lib/resumeSectionOrder";

const MUTED_COLOR = "4b5563";
const TITLE_COLOR = "374151";

function heading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    border: { bottom: { color: "9ca3af", space: 2, style: "single", size: 4 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 20 })],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: `•  ${text}`, size: 20 })],
  });
}

function rowParagraph(left: string, right: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: "right", position: 9026 }],
    children: [
      new TextRun({ text: left, bold: true, size: 20 }),
      new TextRun({ text: `\t${right}`, size: 18, color: MUTED_COLOR }),
    ],
  });
}

export function buildResumeDocx(resume: ResumeData): Document {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = resume;

  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: personalInfo.name || "Your Name", bold: true, size: 36 })],
    }),
  ];

  if (personalInfo.title) {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: personalInfo.title, bold: true, size: 24, color: TITLE_COLOR })],
      })
    );
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(" | "),
          size: 18,
          color: MUTED_COLOR,
        }),
      ],
    })
  );

  if (personalInfo.linkedin || personalInfo.website) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: [personalInfo.linkedin, personalInfo.website].filter(Boolean).join(" | "),
            size: 18,
            color: MUTED_COLOR,
          }),
        ],
      })
    );
  }

  const sectionBuilders: Record<ResumeSectionKey, () => Paragraph[]> = {
    summary: () => {
      if (!summary) return [];
      return [heading("Summary"), new Paragraph({ children: [new TextRun({ text: summary, size: 20 })] })];
    },

    experience: () => {
      if (experience.length === 0) return [];
      const paragraphs: Paragraph[] = [heading("Experience")];
      experience.forEach((entry) => {
        paragraphs.push(
          rowParagraph(
            `${entry.title || "Job title"} — ${entry.company || "Company"}`,
            `${entry.startDate} - ${entry.endDate || "Present"}`
          )
        );
        if (entry.location) {
          paragraphs.push(
            new Paragraph({ children: [new TextRun({ text: entry.location, size: 18, color: MUTED_COLOR })] })
          );
        }
        entry.bullets.filter(Boolean).forEach((bullet) => paragraphs.push(bulletParagraph(bullet)));
      });
      return paragraphs;
    },

    education: () => {
      if (education.length === 0) return [];
      const paragraphs: Paragraph[] = [heading("Education")];
      education.forEach((entry) => {
        paragraphs.push(
          rowParagraph(
            `${entry.degree}${entry.field ? ` in ${entry.field}` : ""} — ${entry.school}`,
            `${entry.startDate} - ${entry.endDate}`
          )
        );
      });
      return paragraphs;
    },

    skills: () => {
      if (skills.length === 0) return [];
      return [heading("Skills"), new Paragraph({ children: [new TextRun({ text: skills.join(", "), size: 20 })] })];
    },

    projects: () => {
      if (projects.length === 0) return [];
      const paragraphs: Paragraph[] = [heading("Projects")];
      projects.forEach((entry) => {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: entry.name, bold: true, size: 20 })],
          })
        );
        (entry.links ?? []).forEach((link) => {
          paragraphs.push(
            new Paragraph({ children: [new TextRun({ text: link, size: 18, color: MUTED_COLOR })] })
          );
        });
        if (entry.description) {
          paragraphs.push(new Paragraph({ children: [new TextRun({ text: entry.description, size: 20 })] }));
        }
        if (entry.techStack) {
          paragraphs.push(
            new Paragraph({ children: [new TextRun({ text: entry.techStack, size: 18, color: MUTED_COLOR })] })
          );
        }
        (entry.bullets ?? []).filter(Boolean).forEach((bullet) => paragraphs.push(bulletParagraph(bullet)));
      });
      return paragraphs;
    },

    certifications: () => {
      if (certifications.length === 0) return [];
      const paragraphs: Paragraph[] = [heading("Certifications")];
      certifications.forEach((entry) => {
        paragraphs.push(
          rowParagraph(`${entry.name}${entry.issuer ? ` — ${entry.issuer}` : ""}`, entry.date ?? "")
        );
      });
      return paragraphs;
    },
  };

  for (const key of getResumeSectionOrder(resume)) {
    children.push(...sectionBuilders[key]());
  }

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: "Helvetica", size: 20 },
          paragraph: { alignment: AlignmentType.LEFT },
        },
      },
    },
  });
}
