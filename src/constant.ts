export const STORE = {
  name: {
    en: "La Boutique by BNM",
    fr: "La Boutique by BNM",
    tr: "La Boutique by BNM",
  },
  category: {
    en: "Boutique Store",
    fr: "Boutique Store",
    tr: "Butik Mağazası",
  },
  description: {
    en: "La Boutique by BNM is an online store specialized in distributing high-tech products and latest-generation digital accessories in Cameroon. Based in Yaoundé, the company’s mission is to make innovation accessible to everyone by offering a rigorous selection of gadgets combining design, usefulness, and modernity.",
    fr: "La Boutique by BNM est une enseigne de commerce en ligne spécialisée dans la distribution de produits high-tech et d'accessoires numériques de dernière génération au Cameroun. Basée à Yaoundé, l'entreprise s'est donnée pour mission de rendre l'innovation accessible à tous, en proposant une sélection rigoureuse de gadgets alliant design, utilité et modernité.",
    tr: "La Boutique by BNM, Kamerun’da en yeni nesil dijital aksesuarlar ve yüksek teknoloji ürünlerinin dağıtımında uzmanlaşmış bir çevrim içi mağazadır. Yaoundé merkezli şirket, tasarım, fayda ve modernliği bir araya getiren cihazları titizlikle seçerek inovasyonu herkes için erişilebilir kılmayı hedefler.",
  },
  location: {
    city: "Yaoundé",
    country: "Cameroun",
    display: {
      en: "Yaoundé, Cameroon.",
      fr: "Yaoundé, Cameroun.",
      tr: "Yaoundé, Kamerun.",
    },
  },
  email: "henryemmanuel@gmail.com",
  phone: "+237 6 70 02 18 26",
  openingHours: [
    {
      day: "monday",
      label: { en: "Monday", fr: "Lundi", tr: "Pazartesi" },
      opensAt: 9 * 60 * 60 * 1000,   // 09:00
      closesAt: 17 * 60 * 60 * 1000, // 17:00
    },
    {
      day: "tuesday",
      label: { en: "Tuesday", fr: "Mardi", tr: "Salı" },
      opensAt: 9 * 60 * 60 * 1000,   // 09:00
      closesAt: 17 * 60 * 60 * 1000, // 17:00
    },
    {
      day: "wednesday",
      label: { en: "Wednesday", fr: "Mercredi", tr: "Çarşamba" },
      opensAt: 9 * 60 * 60 * 1000,   // 09:00
      closesAt: 17 * 60 * 60 * 1000, // 17:00
    },
    {
      day: "thursday",
      label: { en: "Thursday", fr: "Jeudi", tr: "Perşembe" },
      opensAt: 9 * 60 * 60 * 1000,   // 09:00
      closesAt: 17 * 60 * 60 * 1000, // 17:00
    },
    {
      day: "friday",
      label: { en: "Friday", fr: "Vendredi", tr: "Cuma" },
      opensAt: 9 * 60 * 60 * 1000,   // 09:00
      closesAt: 17 * 60 * 60 * 1000, // 17:00
    },
    {
      day: "saturday",
      label: { en: "Saturday", fr: "Samedi", tr: "Cumartesi" },
      opensAt: 9 * 60 * 60 * 1000,   // 09:00
      closesAt: 15 * 60 * 60 * 1000, // 15:00
    },
    {
      day: "sunday",
      label: { en: "Sunday", fr: "Dimanche", tr: "Pazar" },
      opensAt: 9 * 60 * 60 * 1000,   // 09:00
      closesAt: 13 * 60 * 60 * 1000, // 13:00
    },
  ],
} as const;
