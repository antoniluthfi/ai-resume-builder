"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { CoverLetterPdfDocument } from "./CoverLetterPdfDocument";
import { smallButtonClass } from "@/lib/formStyles";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <span className={smallButtonClass} aria-disabled>
        Preparing PDF…
      </span>
    ),
  }
);

export function CoverLetterPdfDownloadButton({
  senderName,
  senderContact,
  subject,
  body,
}: {
  senderName: string;
  senderContact: string;
  subject: string;
  body: string;
}) {
  const fileName = `Cover_Letter_${senderName || "applicant"}.pdf`.replace(/\s+/g, "_");

  const pdfDocument = useMemo(
    () => (
      <CoverLetterPdfDocument
        senderName={senderName}
        senderContact={senderContact}
        subject={subject}
        body={body}
      />
    ),
    [senderName, senderContact, subject, body]
  );

  return (
    <PDFDownloadLink document={pdfDocument} fileName={fileName}>
      {({ loading }) => (
        <span className={smallButtonClass}>{loading ? "Preparing PDF…" : "Download PDF"}</span>
      )}
    </PDFDownloadLink>
  );
}
