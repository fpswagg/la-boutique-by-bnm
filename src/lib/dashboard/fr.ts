export const dashboardFr = {
  nav: {
    accent: "tableau de bord",
    overview: "Vue d'ensemble",
    products: "Produits",
    createProduct: "Nouveau produit",
    storeConfig: "Configuration boutique",
    integrations: "Intégrations",
    sawabo: "Sawabo",
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
    },
    recentEvents: "Dernières interactions",
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
  sawabo: {
    accent: "intégrations",
    title: "Sawabo",
    subtitle: "Console webhook signée vers le bot Sawabo",
    tabs: {
      console: "Console",
      sessions: "Sessions",
      groups: "Groupes & publication",
      jobs: "Tâches",
      activity: "Activité & callbacks",
    },
    status: {
      pending: "En attente",
      accepted: "Accepté (async)",
      done: "Terminé",
      failed: "Échec",
    },
    fields: {
      action: "Action",
      requestId: "ID de requête",
      payload: "Données (JSON)",
      sessionKey: "Clé de session",
      botBaseUrl: "URL du bot",
      webhookSecret: "Secret webhook",
      callbackUrl: "URL de callback",
      callbackSecret: "Secret callback",
      enabled: "Intégration active",
      maxRequestsPerHour: "Limite / heure",
      defaultGroupIds: "Groupes par défaut (IDs, virgules)",
      allowedActions: "Actions autorisées (vide = toutes)",
    },
    actions: {
      send: "Envoyer la requête",
      saveConfig: "Enregistrer la configuration",
      ping: "Ping",
      getStatus: "État du bot",
      refresh: "Actualiser",
    },
    console: {
      lastResult: "Dernière réponse",
      httpStatus: "Code HTTP",
    },
    sessions: {
      connectivity: "Connectivité",
      config: "Configuration webhook",
    },
    groups: {
      productsHint: "Produits publiés disponibles pour post_product / post_products",
      pickProduct: "Choisir un produit",
    },
    jobs: {
      hint: "Actions create_job, pause_job, resume_job, run_job_now, cancel_job",
    },
    activity: {
      requests: "Requêtes récentes",
      callbacks: "Callbacks reçus",
      statsTitle: "Statistiques opérationnelles",
      successRate: "Taux de succès",
      pending: "En cours",
      failures: "Échecs",
      byAction: "Par action",
    },
    empty: "Aucune donnée pour le moment.",
    errors: {
      invalidJson: "JSON invalide.",
      dispatchFailed: "Échec de l'envoi webhook.",
    },
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
    },
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
    sendingWebhook: "Envoi en cours…",
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

export function productStatusLabelFr(status: string): string {
  const key = status as keyof typeof dashboardFr.products.statusLabels;
  return dashboardFr.products.statusLabels[key] ?? status;
}

export function sawaboStatusLabelFr(status: string): string {
  const key = status as keyof typeof dashboardFr.sawabo.status;
  return dashboardFr.sawabo.status[key] ?? status;
}

export function localeLabelFr(locale: string | null | undefined): string {
  if (!locale) return dashboardFr.overview.emptyValue;
  const key = locale.toLowerCase() as keyof typeof dashboardFr.overview.localeLabels;
  return dashboardFr.overview.localeLabels[key] ?? locale;
}

export function productImageAltFr(productName: string): string {
  return `Image du produit : ${productName}`;
}
