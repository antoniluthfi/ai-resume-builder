"use client";

import dynamic from "next/dynamic";
import { FileArrowDownIcon as FileArrowDown } from "@phosphor-icons/react/dist/ssr/FileArrowDown";
import { useResumeStore } from "@/store/resumeStore";
import { ResumePdfDocument } from "./ResumePdfDocument";
import { primaryButtonClass } from "@/lib/formStyles";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <span className={primaryButtonClass} aria-disabled>
        <FileArrowDown size={16} weight="bold" />
        <span className="hidden lg:inline">Preparing PDF…</span>
        <span className="lg:hidden">PDF</span>
      </span>
    ),
  }
);

export function PdfDownloadButton() {
  const resume = useResumeStore((s) => s.resume);
  const hiddenProjectIds = useResumeStore((s) => s.hiddenProjectIds);
  const fileName = `${resume.personalInfo.name || "resume"}.pdf`.replace(/\s+/g, "_");

  const exportResume = {
    ...resume,
    projects: resume.projects.filter((p) => !hiddenProjectIds.includes(p.id)),
  };

  return (
    <PDFDownloadLink document={<ResumePdfDocument resume={exportResume} />} fileName={fileName}>
      {({ loading }) => (
        <span className={primaryButtonClass}>
          <FileArrowDown size={16} weight="bold" />
          <span className="hidden lg:inline">{loading ? "Preparing PDF…" : "Download ATS-safe PDF"}</span>
          <span className="lg:hidden">PDF</span>
        </span>
      )}
    </PDFDownloadLink>
  );
}
