import { AlignmentType, Document, HeadingLevel, Paragraph, TextRun } from "docx";
import { ResumeData } from "@/types/resume";

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

  if (summary) {
    children.push(heading("Summary"));
    children.push(new Paragraph({ children: [new TextRun({ text: summary, size: 20 })] }));
  }

  if (experience.length > 0) {
    children.push(heading("Experience"));
    experience.forEach((entry) => {
      children.push(
        rowParagraph(
          `${entry.title || "Job title"} — ${entry.company || "Company"}`,
          `${entry.startDate} - ${entry.endDate || "Present"}`
        )
      );
      if (entry.location) {
        children.push(
          new Paragraph({ children: [new TextRun({ text: entry.location, size: 18, color: MUTED_COLOR })] })
        );
      }
      entry.bullets.filter(Boolean).forEach((bullet) => children.push(bulletParagraph(bullet)));
    });
  }

  if (education.length > 0) {
    children.push(heading("Education"));
    education.forEach((entry) => {
      children.push(
        rowParagraph(
          `${entry.degree}${entry.field ? ` in ${entry.field}` : ""} — ${entry.school}`,
          `${entry.startDate} - ${entry.endDate}`
        )
      );
    });
  }

  if (skills.length > 0) {
    children.push(heading("Skills"));
    children.push(new Paragraph({ children: [new TextRun({ text: skills.join(", "), size: 20 })] }));
  }

  if (projects.length > 0) {
    children.push(heading("Projects"));
    projects.forEach((entry) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${entry.name}${entry.link ? ` (${entry.link})` : ""}`,
              bold: true,
              size: 20,
            }),
          ],
        })
      );
      if (entry.description) {
        children.push(new Paragraph({ children: [new TextRun({ text: entry.description, size: 20 })] }));
      }
      (entry.bullets ?? []).filter(Boolean).forEach((bullet) => children.push(bulletParagraph(bullet)));
    });
  }

  if (certifications.length > 0) {
    children.push(heading("Certifications"));
    certifications.forEach((entry) => {
      children.push(
        rowParagraph(`${entry.name}${entry.issuer ? ` — ${entry.issuer}` : ""}`, entry.date ?? "")
      );
    });
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
