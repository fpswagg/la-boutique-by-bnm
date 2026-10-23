export const dashboardFr = {
  auth: {
    intro: "Connectez-vous avec le compte SSS de La Boutique By BNM pour gérer les produits, les commandes et la boutique.",
    signIn: "Se connecter avec SSS",
    off: "La connexion SSS n'est pas encore configurée sur ce site.",
    wrongBusiness: "Ce compte SSS n'est pas connecté à La Boutique By BNM. Reconnectez-vous et choisissez la bonne entreprise.",
    switchAccount: "Changer de compte",
    signOut: "Se déconnecter",
    openSss: "Ouvrir SSS",
    viewShop: "Voir la boutique",
    readOnly: "lecture seule",
  },
  nav: {
    accent: "tableau de bord",
    overview: "Vue d'ensemble",
    orders: "Commandes",
    products: "Produits",
    createProduct: "Nouveau produit",
    storeConfig: "Configuration boutique",
    brand: "La Boutique",
  },
  overview: {
    accent: "tableau de bord",
    title: "Vue d'ensemble",
    cards: {
      products: "Produits",
      published: "Publiés",
      lowStock: "Stock faible",
      orders: "Commandes",
      eventsToday: "Activité du jour",
      pendingOrders: "Commandes à traiter",
      views: "Vues",
    },
    recentEvents: "Dernières interactions",
    recentOrders: "Dernières commandes",
    allOrders: "Toutes les commandes",
    allTimeViews: "Vues depuis le début",
    event: "Interaction",
    article: "Article",
    product: "Produit",
    locale: "Langue du visiteur",
    time: "Quand ?",
    emptyValue: "—",
    chartTitle: "Les coups de projecteur : fiches les plus vues",
    chartViews: "Vues",
    clearAnalytics: "Effacer les statistiques",
    clearAnalyticsConfirm:
      "Effacer toutes les interactions et remettre les compteurs de vues à zéro ? Cette action est irréversible.",
    analyticsEvents: {
      view: "Fiche produit vue",
      add_to_cart: "Ajouté au panier",
      like: "Coup de cœur",
    },
    localeLabels: {
      fr: "Visite en français",
      en: "Visite en anglais",
      tr: "Visite en turc",
    },
    window: {
      label: "Période",
      today: "Aujourd'hui",
      week: "7 jours",
      month: "30 jours",
    },
    groupedEvents: "Répartition des interactions",
    count: "Nombre",
  },
  orders: {
    accent: "ventes",
    title: "Commandes",
    empty: "Aucune commande pour l'instant.",
    hint: "Les commandes du site arrivent ici (et dans SSS → Commandes). « Livrée » sort les articles du stock et crée la facture dans SSS.",
    ref: "Réf.",
    client: "Client",
    items: "Articles",
    total: "Total",
    status: "Statut",
    date: "Date",
    source: "Origine",
    change: "Changer",
    whatsapp: "WhatsApp",
    statuses: {
      pending: "À traiter",
      paid: "Payée",
      packed: "Préparée",
      out_for_delivery: "En livraison",
      delivered: "Livrée",
      cancelled: "Annulée",
    },
    sources: { website: "Site", sss: "SSS" },
  },
  products: {
    accent: "catalogue",
    title: "Produits",
    newProduct: "Nouveau produit",
    sort: {
      date: "date",
      name: "nom",
      price: "prix",
      stock: "stock",
      views: "vues",
    },
    search: "Rechercher (nom, réf., catégorie)",
    table: {
      product: "Produit",
      price: "Prix",
      stock: "Stock",
      status: "Statut",
      posted: "Publié le",
      actions: "Actions",
    },
    onRequest: "Sur devis",
    save: "Enregistrer",
    edit: "Modifier",
    delete: "Supprimer",
    duplicate: "Dupliquer",
    stockIn: "En stock",
    stockOut: "Rupture",
    statusLabels: {
      published: "Publié",
      archived: "Archivé",
    },
  },
  productForm: {
    createAccent: "création",
    createTitle: "Nouveau produit",
    editAccent: "édition",
    sections: {
      identification: "Réglages du produit",
      translations: "Noms et catégories par langue",
      priceStock: "Prix et stock",
      tags: "Mots-clés pour le filtre",
      images: "Images",
      currentImages: "Images actuelles",
      showcase: "Mise en avant et mots-clés",
    },
    fields: {
      idOptional: "Adresse web du produit (optionnelle)",
      idOptionalHint:
        "Si vous laissez vide, elle sera créée automatiquement à partir du nom en français.",
      idRequired: "Adresse web du produit",
      idRequiredHint:
        "C'est la fin du lien de la fiche produit. Ne la changez que si vous savez pourquoi : les anciens liens peuvent cesser de marcher.",
      currency: "Devise",
      currencyHint: "Symbole ou code affiché à côté du prix (ex. FCFA, EUR).",
      nameFr: "Nom (FR)",
      nameEn: "Nom (EN)",
      nameTr: "Nom (TR)",
      categoryFr: "Catégorie (FR)",
      categoryEn: "Catégorie (EN)",
      categoryTr: "Catégorie (TR)",
      priceHint: "Laisser vide pour « sur devis »",
      translationHint: "Vide = le texte français est utilisé.",
      categoriesHint: "Existantes :",
      descriptionFr: "Description (FR)",
      descriptionEn: "Description (EN)",
      descriptionTr: "Description (TR)",
      badge: "Badge",
      badgeHint: "Petit mot sur la photo (ex. Nouveau, Promo). Vide = aucun.",
      order: "Ordre d'affichage",
      orderHint: "1 = en premier. Vide = après les autres, du plus récent au plus ancien.",
      featured: "Mettre en avant sur l'accueil",
      price: "Prix",
      stock: "Stock",
      tags: "Mots-clés",
      tagsHint: "Séparez les mots par des virgules (ex. : robe, été, promo).",
      status: "Statut",
      statusHint: "Publié = visible sur la boutique ; archivé = masqué du catalogue.",
    },
    placeholders: {
      tags: "robe, été, promo",
    },
    status: {
      published: "Publié",
      archived: "Archivé",
    },
    images: {
      noImage: "Aucune image sélectionnée",
      addMore: "Choisir des images",
      formatsHint: "Formats : PNG, JPG, WEBP. Plusieurs fichiers possibles.",
      dropHint: "Ou glissez-déposez vos fichiers dans cette zone.",
      remove: "Retirer du lot",
      chooseFilesAria: "Sélectionner des fichiers image sur l'appareil",
    },
    actions: {
      create: "Créer le produit",
      save: "Enregistrer le produit",
      deleteImage: "Supprimer l'image",
    },
  },
  store: {
    accent: "paramètres",
    title: "Configuration boutique",
    sections: {
      identity: "Informations générales",
      descriptions: "Descriptions",
      openingHours: "Horaires d'ouverture",
    },
    fields: {
      nameFr: "Nom (FR)",
      nameEn: "Nom (EN)",
      nameTr: "Nom (TR)",
      categoryFr: "Catégorie (FR)",
      categoryEn: "Catégorie (EN)",
      categoryTr: "Catégorie (TR)",
      locationCity: "Ville",
      locationCountry: "Pays",
      locationFr: "Localisation affichée (FR)",
      locationEn: "Localisation affichée (EN)",
      locationTr: "Localisation affichée (TR)",
      email: "E-mail",
      phone: "Téléphone",
      descriptionFr: "Description (FR)",
      descriptionEn: "Description (EN)",
      descriptionTr: "Description (TR)",
      opensAt: "Ouverture",
      closesAt: "Fermeture",
      closed: "Fermé ce jour",
      whatsapp: "WhatsApp (commandes)",
      deliveryFr: "Livraison (FR)",
      deliveryEn: "Livraison (EN)",
      deliveryTr: "Livraison (TR)",
      labelFr: "Libellé (FR)",
      labelEn: "Libellé (EN)",
      labelTr: "Libellé (TR)",
    },
    hints: {
      openingHours:
        "Réglez l'ouverture et la fermeture avec les listes déroulantes (heure sur 24 h, comme en France).",
    },
    time: {
      hour: "Heure",
      minute: "Minute",
    },
    save: "Enregistrer la configuration",
  },
  weekdays: {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  },
  loading: {
    saving: "Enregistrement…",
    creating: "Création en cours…",
    duplicating: "Duplication en cours…",
    deleting: "Suppression…",
    updatingStock: "Mise à jour…",
    deletingImage: "Suppression de l'image…",
    navigating: "Chargement…",
    clearingAnalytics: "Effacement…",
    savingConfig: "Enregistrement…",
  },
  errors: {
    pageNotFoundTitle: "PAGE INTROUVABLE",
    pageNotFoundHint:
      "Cette page du tableau de bord n'existe pas ou le lien d'accès est incorrect.",
    backToStore: "Retour à la boutique",
    errorTitle: "ERREUR",
    errorHint: "Une erreur inattendue s'est produite. Réessayez ou revenez à la boutique.",
    retry: "Réessayer",
    unauthorized: "Action du tableau de bord non autorisée.",
    uploadFailed: "Echec du téléversement",
    nameRequired: "Les noms sont obligatoires (FR/EN/TR).",
    categoryRequired: "Les catégories sont obligatoires (FR/EN/TR).",
    productNotFound: "Produit introuvable.",
    imageCopyFailed: "Impossible de copier une image depuis l'ancien produit",
  },
} as const;

export function dayLabelFr(day: string): string {
  const key = day.toLowerCase() as keyof typeof dashboardFr.weekdays;
  return dashboardFr.weekdays[key] ?? day;
}

export function analyticsEventLabelFr(event: string): string {
  const key = event as keyof typeof dashboardFr.overview.analyticsEvents;
  return dashboardFr.overview.analyticsEvents[key] ?? event;
}

export function orderStatusLabelFr(status: string): string {
  const key = status as keyof typeof dashboardFr.orders.statuses;
  return dashboardFr.orders.statuses[key] ?? status;
}

export function productStatusLabelFr(status: string): string {
  const key = status as keyof typeof dashboardFr.products.statusLabels;
  return dashboardFr.products.statusLabels[key] ?? status;
}

export function localeLabelFr(locale: string | null | undefined): string {
  if (!locale) return dashboardFr.overview.emptyValue;
  const key = locale.toLowerCase() as keyof typeof dashboardFr.overview.localeLabels;
  return dashboardFr.overview.localeLabels[key] ?? locale;
}

export function productImageAltFr(productName: string): string {
  return `Image du produit : ${productName}`;
}
