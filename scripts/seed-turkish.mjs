import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");

const records = [
  { resource: "about", match: ["title", "Professional Profile"], data: { title: "Profesyonel Profil", content: "Profesyonel gazeteci · İçerik üreticisi · Hikâye anlatıcısı · Tarihe, kültüre ve derinlemesine araştırmaya tutkulu." } },
  { resource: "about", match: ["title", "Background"], data: { title: "Profil", content: "2013 yılından bu yana gazeteci ve haber editörü olarak çalışıyorum. Siyaset, toplum, tarih, kültür ve daha birçok alanda içerikler üretiyorum. Ayrıca, tarihî ve kültürel konularda belgesel ve programlar hazırlıyor, derinlemesine araştırmalar yapıyor ve yaratıcı hikâye anlatımıyla fark yaratan içerikler ortaya koyuyorum." } },
  { resource: "contact", data: { name: "Muhamet", lastname: "Zayani", title: "Gazeteci | İçerik Üreticisi", summary: "2013 yılından bu yana gazeteci ve haber editörü olarak çalışıyorum. Siyaset, toplum, tarih, kültür ve daha birçok alanda içerikler üretiyorum. Ayrıca, tarihî ve kültürel konularda belgesel ve programlar hazırlıyor, derinlemesine araştırmalar yapıyor ve yaratıcı hikâye anlatımıyla fark yaratan içerikler ortaya koyuyorum.", location: "İstanbul, Türkiye" } },

  { resource: "experiences", match: ["name", "AlMawsleya TV Channel"], data: { name: "AlMawsleya TV Kanalı", position: "Haber Editörü ve Program Yapımcısı", date: "2018 – Halen", location: "İstanbul, Türkiye", description: "Her gün haber editörlüğü yapıyor ve aynı zamanda siyaset, toplum ve kültür konularında talk show programları hazırlıyorum." } },
  { resource: "experiences", match: ["name", "Al-Damir Tunisian Newspaper"], data: { name: "Al-Damir Tunus Gazetesi", position: "Muhabir", date: "2016 – 2017", location: "Tunus", description: "Bu dönemde siyasi olayları, toplumsal hareketleri ve kültürel etkinlikleri yerel muhabir olarak takip edip haberleştirdim." } },
  { resource: "experiences", match: ["name", "Saraha FM Radio"], data: { name: "Saraha FM Radyo", position: "Radyo Muhabiri", date: "2015 – 2016", location: "Safakes, Tunus", description: "Bu dönemde günlük haberleri ve güncel gelişmeleri takip ederek radyo muhabiri olarak görev yaptım." } },
  { resource: "experiences", match: ["name", "Al-Moutawassit TV Channel"], data: { name: "Al-Moutawassit TV Kanalı", position: "Program Yapımcısı", date: "2015", location: "Tunus", description: "Ramazan ayında yayınlanan “Asoor wa Aalam Al-Moutawassit” adlı tarihî programın tüm prodüksiyonundan sorumluydum. İslâm fetihlerinden sonra Tunus'taki önemli şahsiyetlerin biyografilerini ekibimle birlikte hazırladım." } },
  { resource: "experiences", match: ["name", "Al-Aseel for Audiovisual Production"], data: { name: "Al-Aseel for Audiovisual Production", position: "Şirket Yöneticisi", date: "2013 – 2015", location: "Safakes, Tunus", description: "Şirketin yönetimiyle birlikte birçok medya hizmeti sundum. Al-Moutawassit TV, Al-Hiwar Ettounsi TV, Attessia TV, Al-Quds TV, Al-Araby TV, Al Jazeera Mubasher, AFP, France 24, RT Arabic ve RT Russia gibi kurumlarla çalıştım." } },
  { resource: "experiences", match: ["name", "Tanween Podcast"], data: { name: "TANWEEN Podcast", position: "İçerik Üreticisi", date: "2020", description: "Tunus ve Mağrip'teki tarihî olayları yaratıcı bir anlatımla birleştirerek Tanween podcast için içerikler ürettim." } },
  { resource: "experiences", match: ["name", "BelTounsi Page"], data: { name: "BelTounsi Sayfası", position: "İçerik Üreticisi", date: "2021 – 2023", description: "Tunus'taki önemli güncel olaylara odaklanan BelTounsi sayfası için halkın ilgisini çeken içerikler ürettim ve dijital ortamda sade ve etkileyici bir biçimde sundum." } },

  { resource: "education", match: ["certificate", "Professional Master's in Multimedia Journalism"], data: { certificate: "Multimedya Gazeteciliği Yüksek Lisansı", institute: "Edebiyat ve Beşerî Bilimler Fakültesi", date: "2017 – 2018", location: "Safakes, Tunus" } },
  { resource: "education", match: ["certificate", "Bachelor's Degree in History"], data: { certificate: "Tarih Lisansı", institute: "Edebiyat ve Beşerî Bilimler Fakültesi", date: "2010 – 2011", location: "Safakes, Tunus" } },
  { resource: "training", match: ["title", "Online Research Methods and the Use of Metadata in Security Sector Governance"], data: { title: "Çevrimiçi Araştırma Yöntemleri ve Güvenlik Sektöründe Meta Veri Kullanımı Eğitimi", provider: "Cenevre Demokratik Kontrol Merkezi (Silahlı Kuvvetler)", date: "2017" } },
  { resource: "training", match: ["title", "International Protection of Refugees and Advocacy in Asylum Issues"], data: { title: "Mülteci Sorunları ve Sığınma Hakkı Savunuculuğu", provider: "Uluslararası Mülteciler Yüksek Komiserliği (UNHCR)", date: "2016" } },
  { resource: "training", match: ["title", "Local Affairs: How to Make Community Issues an Attractive News Story"], data: { title: "Çekici Bir Haber Hikayesi Oluşturma Eğitimi", provider: "Tunus Basın, İfade Özgürlüğü ve Alman Uluslararası İş Birliği Merkezi", date: "2015" } },

  { resource: "types", match: ["name", "Journalism & Editorial"], data: { name: "Gazetecilik ve Editoryal" } },
  { resource: "types", match: ["name", "Content Production & Storytelling"], data: { name: "İçerik Üretimi ve Hikâye Anlatımı" } },
  { resource: "types", match: ["name", "Research & Verification"], data: { name: "Araştırma ve Doğrulama" } },
  { resource: "types", match: ["name", "AI & Digital Tools"], data: { name: "Yapay Zekâ ve Dijital Araçlar" } },
  { resource: "types", match: ["name", "Software Tools"], data: { name: "Yazılım Araçları" } },
  { resource: "types", match: ["name", "Professional Strengths"], data: { name: "Profesyonel Yetkinlikler" } },

  ...Object.entries({
    "News Editing": "Haber Editörlüğü", "News Reporting": "Haber Muhabirliği", "Talk-show Production": "Talk Show Yapımcılığı", "Editorial Planning": "Editoryal Planlama", "Radio Correspondence": "Radyo Muhabirliği",
    "Content Production": "İçerik Üretimi", "Historical Storytelling": "Tarihî Hikâye Anlatımı", "Cultural Content": "Kültürel İçerik", "Podcast Production": "Podcast Yapımcılığı", "Social Media Content": "Sosyal Medya İçeriği", "Visual Content Production": "Görsel İçerik Üretimi",
    "In-depth Research": "Derinlemesine Araştırma", "Online Research": "Çevrimiçi Araştırma", "Metadata Research": "Meta Veri Araştırması", "Source Verification": "Kaynak Doğrulama", "Fact-checking": "Bilgi Doğrulama", "Misinformation Detection": "Yanlış Bilgi Tespiti",
    "AI-assisted Content Production": "Yapay Zekâ Destekli İçerik Üretimi", "Visual Content Enhancement": "Görsel İçerik İyileştirme", "Information Summarization": "Bilgi Özetleme", "Data Analysis & Insight Extraction": "Veri Analizi ve İçgörü Çıkarma", "Web & Social Media": "Web ve Sosyal Medya",
    "Microsoft Office": "Microsoft Office", "PowerPoint": "PowerPoint", "Microsoft Access": "Microsoft Access",
    "Creative Thinking": "Yaratıcı Düşünme", "Project Management": "Proje Yönetimi", "Strategic Planning": "Stratejik Planlama", "Leadership": "Liderlik", "Team Collaboration": "Takım Çalışması ve İş Birliği"
  }).map(([english, turkish]) => ({ resource: "skills", match: ["name", english], data: { name: turkish, ...(["Microsoft Office", "PowerPoint"].includes(english) ? { level: "İleri" } : english === "Microsoft Access" ? { level: "Yetkin" } : {}) } })),

  { resource: "languages", match: ["name", "Arabic"], data: { name: "Arapça", level: "Ana dil" } },
  { resource: "languages", match: ["name", "French"], data: { name: "Fransızca", level: "Akıcı" } },
  { resource: "languages", match: ["name", "English"], data: { name: "İngilizce", level: "Profesyonel yeterlilik" } },
  { resource: "languages", match: ["name", "Turkish"], data: { name: "Türkçe", level: "Orta" } },

  { resource: "settings", data: {
    siteTitle: "Muhamet Zayani | Gazeteci ve İçerik Üreticisi", siteDescription: "Gazeteci ve içerik üreticisi Muhamet Zayani'nin deneyimlerini, çalışmalarını ve yetkinliklerini sunan profesyonel portföyü.",
    heroEyebrow: "Merhaba, ben", heroCtaLabel: "Çalışmalarımı keşfet", portraitLabelPrefix: "Yaşadığı yer",
    navAboutLabel: "Hakkımda", navExperienceLabel: "Deneyim", navEducationLabel: "Eğitim", navWorkLabel: "Seçili Çalışmalar", navSkillsLabel: "Uzmanlık", navLanguagesLabel: "Diller", navContactLabel: "İletişim", navCvLabel: "Özgeçmiş",
    experienceKicker: "Kariyerim", experienceTitle: "Profesyonel deneyim", educationKicker: "Geçmiş", educationTitle: "Eğitim ve sertifikalar", educationDegreesHeading: "Akademik eğitim", educationTrainingHeading: "Eğitim ve sertifikalar",
    workKicker: "Gazetecilik ve medya", workTitle: "Seçili çalışmalar", skillsKicker: "Uzmanlık alanlarım", skillsTitle: "Gazetecilik uzmanlığı", languagesKicker: "Çok dilli iletişim", languagesTitle: "Dört dil",
    contactKicker: "Birlikte çalışalım", contactTitle: "İletişime geçin", contactFallbackText: "Bir hikâye, yapım veya çalışma fırsatınız mı var? Bana mesaj gönderin.",
    formNameLabel: "Ad", formEmailLabel: "E-posta", formSubjectLabel: "Konu", formMessageLabel: "Mesaj", formSubmitLabel: "Mesaj gönder", formSendingLabel: "Gönderiliyor…",
    formSuccessTitle: "Mesaj gönderildi!", formSuccessMessage: "İletişime geçtiğiniz için teşekkürler. En kısa sürede yanıt vereceğim.", formErrorTitle: "Mesaj gönderilemedi", formErrorMessage: "Lütfen kısa bir süre sonra tekrar deneyin.",
    cvKicker: "Özgeçmiş", cvTitle: "Profesyonel özgeçmiş", cvDownloadLabel: "Özgeçmişi indir", footerText: "Muhamet Zayani"
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
    if (!id) throw new Error(`Could not match Turkish translation for ${record.resource}: ${record.match?.[1] ?? "singleton"}`);
    await client.query(
      `INSERT INTO "content_translations" ("resource", "record_id", "locale", "data") VALUES ($1, $2, 'tr', $3::jsonb)
       ON CONFLICT ("resource", "record_id", "locale") DO UPDATE SET "data" = EXCLUDED."data"`,
      [record.resource, id, JSON.stringify(record.data)],
    );
    imported += 1;
  }
  await client.query("COMMIT");
  console.log(`Imported ${imported} Turkish translations.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
