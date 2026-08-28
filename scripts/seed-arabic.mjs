import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");

const records = [
  { resource: "about", match: ["title", "Professional Profile"], data: { title: "الملف المهني", content: "صحافة مهنية · محتوى متنوع هادف · سرد تاريخي ملهم" } },
  { resource: "about", match: ["title", "Background"], data: { title: "المقدمة", content: "أعمل كصحفي ومحرر أخبار منذ سنة 2013 كما أعد برامج حوارية في مختلف المجالات السياسية والاجتماعية والتاريخية والثقافية، فضلاً عن إنتاج محتويات تتعلق بعدد من المواضيع التاريخية والثقافية، أتميز بالدقة، المصداقية، والبحث العميق والقدرة على صياغة محتوى يجمع بين المصداقية والإبداع." } },
  { resource: "contact", data: { name: "محمد", lastname: "الزياني", title: "محرر مرئي | منتج محتوى", summary: "أعمل كصحفي ومحرر أخبار منذ سنة 2013 كما أعد برامج حوارية في مختلف المجالات السياسية والاجتماعية والتاريخية والثقافية، فضلاً عن إنتاج محتويات تتعلق بعدد من المواضيع التاريخية والثقافية، أتميز بالدقة، المصداقية، والبحث العميق والقدرة على صياغة محتوى يجمع بين المصداقية والإبداع.", location: "إسطنبول، تركيا" } },

  { resource: "experiences", match: ["name", "AlMawsleya TV Channel"], data: { name: "قناة الموصلية الفضائية", position: "محرر أخبار ومعد برامج", date: "2018 حتى الآن", location: "إسطنبول، تركيا", description: "أعمل كمحرر للأخبار اليومية إضافة إلى إعداد برامج حوارية في مختلف المجالات السياسية والاجتماعية والثقافية." } },
  { resource: "experiences", match: ["name", "Al-Damir Tunisian Newspaper"], data: { name: "صحيفة الضمير التونسية", position: "مراسل صحفي", date: "2016 – 2017", location: "تونس", description: "عملت خلال هذه المدة على نقل الأحداث السياسية والتحركات الاجتماعية والتظاهرات الثقافية كمراسل محلي." } },
  { resource: "experiences", match: ["name", "Saraha FM Radio"], data: { name: "راديو صراحة أف أم التونسي", position: "مراسل إذاعي", date: "2015 – 2016", location: "صفاقس، تونس", description: "عملت خلال هذه المدة على نقل المستجدات والأحداث اليومية كمراسل محلي." } },
  { resource: "experiences", match: ["name", "Al-Moutawassit TV Channel"], data: { name: "قناة المتوسط التونسية", position: "معد برنامج", date: "2015", location: "تونس", description: "قمت بالإشراف على الإعداد الكامل لبرنامج تاريخي بعنوان «عصور وأعلام المتوسط»، الذي عرض خلال شهر رمضان، ويروي سيرة عدد من أعلام تونس بعد الفتح الإسلامي." } },
  { resource: "experiences", match: ["name", "Al-Aseel for Audiovisual Production"], data: { name: "الأصيل للإنتاج السمعي البصري", position: "وكيل شركة", date: "2013 – 2015", location: "صفاقس، تونس", description: "شغلت خلال هذه المدة مهمة إدارة المؤسسة، حيث تم تقديم خدمات إعلامية يومية لعدد من المؤسسات التونسية والعربية والدولية مثل قناة المتوسط وقناة الحوار التونسي وقناة التاسعة التونسية بالإضافة إلى قناة القدس والتلفزيون العربي وقناة الجزيرة مباشر ووكالة فرانس براس وقناة فرانس 24 وقناة RT العربية وقناة RT الروسية." } },
  { resource: "experiences", match: ["name", "Tanween Podcast"], data: { name: "بودكاست تنوين", position: "منتج ومعد محتوى", date: "2020", description: "أنجزت أعمالاً لفائدة بودكاست تنوين، تناولت أحداثاً تاريخية حقيقية من تاريخ بلاد المغرب العربي، مع توظيف أسلوب إبداعي في السرد وإضافة لمسة فنية إلى الروايات التاريخية، بهدف تقديم محتوى يجمع بين الدقة التاريخية وجاذبية السرد." } },
  { resource: "experiences", match: ["name", "BelTounsi Page"], data: { name: "صفحة بالتونسي", position: "منتج وصانع محتوى", date: "2021 – 2023", description: "أنجزت أعمالاً لفائدة صفحة «بالتونسي»، تناولت أبرز الأحداث التاريخية التي شغلت الرأي العام في تونس، من خلال إعداد وتقديم محتوى تاريخي بأسلوب مبسط وجذاب يتناسب مع طبيعة المحتوى الرقمي." } },

  { resource: "education", match: ["certificate", "Professional Master's in Multimedia Journalism"], data: { certificate: "الماجستير المهني في الصحافة متعددة الوسائط", institute: "كلية الآداب والعلوم الإنسانية", date: "2017 – 2018", location: "صفاقس، تونس" } },
  { resource: "education", match: ["certificate", "Bachelor's Degree in History"], data: { certificate: "الإجازة الأساسية في التاريخ", institute: "كلية الآداب والعلوم الإنسانية", date: "2010 – 2011", location: "صفاقس، تونس" } },
  { resource: "training", match: ["title", "Online Research Methods and the Use of Metadata in Security Sector Governance"], data: { title: "أساليب البحث عبر الإنترنت واستخدام البيانات الوصفية في معالجة قضايا الحوكمة الأمنية لقطاع الأمن", provider: "مركز جنيف للرقابة الديمقراطية على القوات المسلحة", date: "2017" } },
  { resource: "training", match: ["title", "International Protection of Refugees and Advocacy in Asylum Issues"], data: { title: "الحماية الدولية للاجئين والمناصرة لقضايا اللجوء", provider: "المفوضية السامية للأمم المتحدة لشؤون اللاجئين", date: "2016" } },
  { resource: "training", match: ["title", "Local Affairs: How to Make Community Issues an Attractive News Story"], data: { title: "الشؤون المحلية: كيف نجعل شؤون المجتمع المحلي مادة إخبارية جذابة", provider: "مركز تونس لحرية الصحافة والتعاون الدولي الألماني", date: "2015" } },

  { resource: "types", match: ["name", "Journalism & Editorial"], data: { name: "الصحافة والتحرير" } },
  { resource: "types", match: ["name", "Content Production & Storytelling"], data: { name: "إنتاج المحتوى والسرد" } },
  { resource: "types", match: ["name", "Research & Verification"], data: { name: "البحث والتحقق" } },
  { resource: "types", match: ["name", "AI & Digital Tools"], data: { name: "الذكاء الاصطناعي والأدوات الرقمية" } },
  { resource: "types", match: ["name", "Software Tools"], data: { name: "الأدوات البرمجية" } },
  { resource: "types", match: ["name", "Professional Strengths"], data: { name: "المهارات المهنية" } },

  ...Object.entries({
    "News Editing": "تحرير الأخبار", "News Reporting": "التغطية الإخبارية", "Talk-show Production": "إعداد البرامج الحوارية", "Editorial Planning": "التخطيط التحريري", "Radio Correspondence": "المراسلة الإذاعية",
    "Content Production": "إنتاج المحتوى", "Historical Storytelling": "السرد التاريخي", "Cultural Content": "المحتوى الثقافي", "Podcast Production": "إنتاج البودكاست", "Social Media Content": "محتوى وسائل التواصل الاجتماعي", "Visual Content Production": "إنتاج المحتوى البصري",
    "In-depth Research": "البحث المعمق", "Online Research": "البحث عبر الإنترنت", "Metadata Research": "البحث باستخدام البيانات الوصفية", "Source Verification": "التحقق من المصادر", "Fact-checking": "تدقيق المعلومات", "Misinformation Detection": "كشف الأخبار غير الموثوقة",
    "AI-assisted Content Production": "إنتاج المحتوى بمساعدة الذكاء الاصطناعي", "Visual Content Enhancement": "تحسين المحتوى البصري", "Information Summarization": "تلخيص المعلومات", "Data Analysis & Insight Extraction": "تحليل البيانات واستخراج الأفكار", "Web & Social Media": "الويب ووسائل التواصل الاجتماعي",
    "Microsoft Office": "مايكروسوفت أوفيس", "PowerPoint": "باور بوينت", "Microsoft Access": "مايكروسوفت أكسس",
    "Creative Thinking": "التفكير الإبداعي", "Project Management": "إدارة المشاريع", "Strategic Planning": "التخطيط الاستراتيجي", "Leadership": "القيادة", "Team Collaboration": "التعاون والعمل الجماعي"
  }).map(([english, arabic]) => ({ resource: "skills", match: ["name", english], data: { name: arabic, ...(["Microsoft Office", "PowerPoint"].includes(english) ? { level: "متقدم" } : english === "Microsoft Access" ? { level: "متمكن" } : {}) } })),

  { resource: "languages", match: ["name", "Arabic"], data: { name: "العربية", level: "اللغة الأم" } },
  { resource: "languages", match: ["name", "French"], data: { name: "الفرنسية", level: "طلاقة" } },
  { resource: "languages", match: ["name", "English"], data: { name: "الإنجليزية", level: "كفاءة مهنية" } },
  { resource: "languages", match: ["name", "Turkish"], data: { name: "التركية", level: "متوسط" } },

  { resource: "settings", data: {
    siteTitle: "محمد الزياني | محرر مرئي ومنتج محتوى", siteDescription: "الموقع المهني للصحفي ومنتج المحتوى محمد الزياني، ويعرض خبراته وأعماله ومهاراته.",
    heroEyebrow: "مرحباً، أنا", heroCtaLabel: "استكشف أعمالي", portraitLabelPrefix: "مقيم في",
    navAboutLabel: "نبذة", navExperienceLabel: "الخبرات", navEducationLabel: "التعليم", navWorkLabel: "أعمال مختارة", navSkillsLabel: "الخبرات المهنية", navLanguagesLabel: "اللغات", navContactLabel: "اتصل بي", navCvLabel: "السيرة الذاتية",
    experienceKicker: "مسيرتي", experienceTitle: "الخبرات العملية", educationKicker: "المؤهلات", educationTitle: "التعليم والتدريب", educationDegreesHeading: "التعليم الأكاديمي", educationTrainingHeading: "الدورات التدريبية",
    workKicker: "الصحافة والإعلام", workTitle: "أعمال مختارة", skillsKicker: "مجالات خبرتي", skillsTitle: "الخبرات الصحفية", languagesKicker: "تواصل متعدد اللغات", languagesTitle: "أربع لغات",
    contactKicker: "لنعمل معاً", contactTitle: "يسعدني التواصل معك", contactFallbackText: "هل لديك قصة أو إنتاج أو فرصة عمل؟ أرسل لي رسالة.",
    formNameLabel: "الاسم", formEmailLabel: "البريد الإلكتروني", formSubjectLabel: "الموضوع", formMessageLabel: "الرسالة", formSubmitLabel: "إرسال الرسالة", formSendingLabel: "جارٍ الإرسال…",
    formSuccessTitle: "تم إرسال الرسالة!", formSuccessMessage: "شكراً لتواصلك. سأرد عليك قريباً.", formErrorTitle: "تعذر إرسال الرسالة", formErrorMessage: "يرجى المحاولة مرة أخرى بعد قليل.",
    cvKicker: "السيرة الذاتية", cvTitle: "المسيرة المهنية", cvDownloadLabel: "تنزيل السيرة الذاتية", footerText: "محمد الزياني"
  } }
];

const tables = { about: "about", contact: "contact", education: "education", experiences: "experiences", languages: "languages", settings: "site_settings", skills: "skills", training: "training", types: "skill_types", work: "works" };
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query("BEGIN");
  let imported = 0;
  for (const record of records) {
    const table = tables[record.resource];
    const result = record.match
      ? await client.query(`SELECT "_id" FROM "${table}" WHERE "${record.match[0]}" = $1 LIMIT 1`, [record.match[1]])
      : await client.query(`SELECT "_id" FROM "${table}" ORDER BY "_id" LIMIT 1`);
    const id = result.rows[0]?._id;
    if (!id) throw new Error(`Could not match Arabic translation for ${record.resource}: ${record.match?.[1] ?? "singleton"}`);
    await client.query(
      `INSERT INTO "content_translations" ("resource", "record_id", "locale", "data") VALUES ($1, $2, 'ar', $3::jsonb)
       ON CONFLICT ("resource", "record_id", "locale") DO UPDATE SET "data" = EXCLUDED."data"`,
      [record.resource, id, JSON.stringify(record.data)],
    );
    imported += 1;
  }
  await client.query("COMMIT");
  console.log(`Imported ${imported} Arabic translations.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
