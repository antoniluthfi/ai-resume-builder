import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/types/resume";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  name: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  professionalTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#374151", marginTop: 2 },
  contactLine: { fontSize: 9, color: "#4b5563", marginTop: 2 },
  section: { marginTop: 12 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    borderBottom: "1 solid #9ca3af",
    paddingBottom: 3,
    marginBottom: 6,
  },
  entry: { marginBottom: 6 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#4b5563", fontSize: 9 },
  bullet: { flexDirection: "row", marginTop: 2 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1 },
});

export function ResumePdfDocument({ resume }: { resume: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = resume;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{personalInfo.name || "Your Name"}</Text>
        {personalInfo.title && <Text style={styles.professionalTitle}>{personalInfo.title}</Text>}
        <Text style={styles.contactLine}>
          {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(" | ")}
        </Text>
        {(personalInfo.linkedin || personalInfo.website) && (
          <Text style={styles.contactLine}>
            {[personalInfo.linkedin, personalInfo.website].filter(Boolean).join(" | ")}
          </Text>
        )}

        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text>{summary}</Text>
          </View>
        )}

        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <View style={styles.rowBetween}>
                  <Text style={styles.bold}>
                    {entry.title || "Job title"} — {entry.company || "Company"}
                  </Text>
                  <Text style={styles.muted}>
                    {entry.startDate} - {entry.endDate || "Present"}
                  </Text>
                </View>
                {entry.location && <Text style={styles.muted}>{entry.location}</Text>}
                {entry.bullets.filter(Boolean).map((bullet, i) => (
                  <View key={i} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((entry) => (
              <View key={entry.id} style={styles.rowBetween}>
                <Text>
                  {entry.degree} {entry.field && `in ${entry.field}`} — {entry.school}
                </Text>
                <Text style={styles.muted}>
                  {entry.startDate} - {entry.endDate}
                </Text>
              </View>
            ))}
          </View>
        )}

        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text>{skills.join(", ")}</Text>
          </View>
        )}

        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <Text style={styles.bold}>
                  {entry.name} {entry.link && `(${entry.link})`}
                </Text>
                <Text>{entry.description}</Text>
              </View>
            ))}
          </View>
        )}

        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((entry) => (
              <View key={entry.id} style={styles.rowBetween}>
                <Text>
                  {entry.name} {entry.issuer && `— ${entry.issuer}`}
                </Text>
                <Text style={styles.muted}>{entry.date}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
