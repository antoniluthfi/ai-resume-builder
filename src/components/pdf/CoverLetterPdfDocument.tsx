import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: "#111827",
    lineHeight: 1.5,
  },
  name: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  contactLine: { fontSize: 9, color: "#4b5563", marginTop: 2 },
  date: { fontSize: 9.5, color: "#4b5563", marginTop: 16 },
  subject: { fontSize: 10.5, fontFamily: "Helvetica-Bold", marginTop: 16 },
  paragraph: { marginTop: 10 },
});

export function CoverLetterPdfDocument({
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
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {senderName && <Text style={styles.name}>{senderName}</Text>}
        {senderContact && <Text style={styles.contactLine}>{senderContact}</Text>}
        <Text style={styles.date}>{today}</Text>
        {subject && <Text style={styles.subject}>Re: {subject}</Text>}
        {paragraphs.map((paragraph, i) => (
          <Text key={i} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
