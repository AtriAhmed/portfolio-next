import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { PortfolioData } from "@/lib/content";

Font.register({
  family: "Montserrat",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtZ6Ew-Y3tcoqK5.ttf",
    },
    {
      src: "https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu170w-Y3tcoqK5.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCvC70w-Y3tcoqK5.ttf",
      fontWeight: 900,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Montserrat",
    fontSize: 12,
    flexDirection: "row",
    color: "#111111",
  },
  leftColumn: {
    width: "40%",
    backgroundColor: "#f8f8f8",
  },
  rightColumn: {
    width: "60%",
    padding: 16,
  },
  identity: {
    padding: 16,
    paddingBottom: 10,
    backgroundColor: "#000000",
    color: "#ffffff",
  },
  sidebar: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  title: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 900,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 600,
  },
  section: {
    marginBottom: 12,
  },
  item: {
    marginBottom: 8,
  },
  content: {
    fontSize: 12,
  },
  detail: {
    marginBottom: 8,
    fontSize: 12,
  },
  darkLink: {
    marginBottom: 8,
    color: "#ffffff",
    fontSize: 12,
    textDecoration: "none",
  },
  workLink: {
    color: "#111111",
    fontSize: 10,
    textDecoration: "none",
  },
});

export function CvDocument({ data }: { data: PortfolioData }) {
  const { contact, education, settings, types } = data;
  const experiences = data.experiences.filter((item) => item.showInCV);
  const works = data.works.filter((item) => item.showInCV);
  const hiddenExperienceCount = data.experiences.length - experiences.length;
  const hiddenWorkCount = data.works.length - works.length;
  const name = contact ? `${contact.name} ${contact.lastname}`.trim() : settings.footerText;
  const portfolioUrl = withProtocol(contact?.website || "ahmedatri.com");

  return (
    <Document title={`${name} CV`} author={name} subject={contact?.title || "Curriculum vitae"}>
      <Page size="A4" style={styles.page}>
        <View style={styles.leftColumn}>
          <View style={styles.identity}>
            <Text style={styles.title}>{name}</Text>
            {contact?.title && <Text style={styles.detail}>{contact.title}</Text>}
            {contact?.email && <Link style={styles.darkLink} src={`mailto:${contact.email}`}>{contact.email}</Link>}
            {contact?.phone && <Text style={styles.detail}>{contact.phone}</Text>}
            {contact?.location && <Text style={styles.detail}>{contact.location}</Text>}
            {contact?.github && <Link style={styles.darkLink} src={withProtocol(contact.github)}>{displayUrl(contact.github)}</Link>}
            {contact?.linkedin && <Link style={styles.darkLink} src={withProtocol(contact.linkedin)}>{displayUrl(contact.linkedin)}</Link>}
            {portfolioUrl && <Link style={styles.darkLink} src={portfolioUrl}>{displayUrl(contact?.website || "ahmedatri.com")}</Link>}
          </View>

          <View style={styles.sidebar}>
            {education && (
              <View style={styles.section}>
                <Text style={styles.title}>{settings.cvEducationHeading}</Text>
                <Text style={styles.content}>{education.certificate}</Text>
                <Text style={styles.content}>{education.institute}</Text>
                <Text style={styles.content}>{education.date}</Text>
                <Text style={styles.content}>{education.location}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.title}>{settings.cvSkillsHeading}</Text>
              {types.map((type) => (
                <View key={type._id} style={styles.item} wrap={false}>
                  <Text style={styles.subtitle}>{type.name}</Text>
                  {type.skills.map((skill) => <Text key={skill._id} style={styles.content}>{skill.name}</Text>)}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.rightColumn}>
          <View style={styles.section}>
            <Text style={styles.title}>Summary</Text>
            <Text style={styles.content}>{contact?.summary || settings.siteDescription}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>{settings.cvProjectsHeading}</Text>
            {works.map((work) => (
              <View key={work._id} style={styles.item} wrap={false}>
                <Text style={styles.subtitle}>{work.name}</Text>
                <Text style={styles.content}>{work.description}</Text>
                <Text style={styles.content}>{work.technologies}</Text>
                {work.link && <Link style={styles.workLink} src={withProtocol(work.link)}>{displayUrl(work.link)}</Link>}
              </View>
            ))}
            {hiddenWorkCount > 0 && <Text style={styles.content}>Explore {hiddenWorkCount} more {hiddenWorkCount === 1 ? "project" : "projects"} at {displayUrl(portfolioUrl)}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>{settings.cvExperienceHeading}</Text>
            {experiences.map((experience) => (
              <View key={experience._id} style={styles.item} wrap={false}>
                <Text style={styles.subtitle}>{experience.name}</Text>
                <Text style={styles.content}>{experience.position}</Text>
                <Text style={styles.content}>{experience.date}</Text>
                <Text style={styles.content}>{experience.description}</Text>
              </View>
            ))}
            {hiddenExperienceCount > 0 && <Text style={styles.content}>Explore {hiddenExperienceCount} more at {displayUrl(portfolioUrl)}</Text>}
          </View>
        </View>
      </Page>
    </Document>
  );
}

function withProtocol(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function displayUrl(value: string) {
  return value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}
