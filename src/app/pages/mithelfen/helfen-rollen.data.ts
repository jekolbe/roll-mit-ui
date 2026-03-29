/** Helfer-Anmeldung (Vereinscloud ADFC Baden-Württemberg, Deutschland). */
export const HELFER_FORMULAR_URL =
  "https://vcloud.adfc-bw.de/index.php/apps/forms/s/PXoPC9nwDN3pDwbZwqn4MeMH";

export interface HelferRolleData {
  slug: string;
  title: string;
  teaser: string;
  icon: string;
  /** Rahmen (Übersichtskacheln & Detailseite) */
  accentBorder: string;
  accentIcon: string;
  accentBg: string;
  einleitung: string[];
  duBrauchst: string[];
  duBekommst: string[];
}

export const HELFER_ROLLEN: HelferRolleData[] = [
  {
    slug: "streckenposten",
    title: "Streckenposten",
    teaser:
      "An Kreuzungen und kritischen Stellen: auf Teilnehmende achten, nie den Verkehr regeln.",
    icon: "traffic",
    accentBorder: "border-baltic-blue/35",
    accentIcon: "text-baltic-blue",
    accentBg: "bg-baltic-blue/10",
    einleitung: [
      "Du unterstützt entlang der Strecke, beispielsweise an Straßenquerungen. Du darfst und wirst nicht den fließenden Verkehr leiten, sondern weist Teilnehmende auf Stellen hin, die besonders vorsichtig befahren werden sollen.",
      "Wir achten darauf, dass Streckenposten immer zu zweit sind.",
    ],
    duBrauchst: [
      "Warnweste",
      "Eventuell einen Stuhl (z. B. Campingstuhl), falls du dich zwischendurch setzen möchtest",
      "Eigene Verpflegung (Trinken und Essen)",
      "Sonnenschutz (nicht alle Plätze sind schattig)",
    ],
    duBekommst: [
      "Fahrt zum Einsatzort, falls du nicht selbst hinfahren möchtest",
      "Eine genaue Einweisung, wann du wo sein sollst",
      "Eine genaue Einweisung, was du darfst und was nicht",
    ],
  },
  {
    slug: "start-und-ziel",
    title: "Helfer:in am Start- und Zielpunkt",
    teaser:
      "Du sorgst dafür, dass der Start- und Zielpunkt gut vorbereitet ist.",
    icon: "event",
    accentBorder: "border-blaze-orange/35",
    accentIcon: "text-blaze-orange",
    accentBg: "bg-blaze-orange/10",
    einleitung: [
      "Du hilfst uns, Start- und Zielpunkt einzurichten. Dazu gehört zum Beispiel: Biertische aufstellen, Absperrbänder anbringen, Material von A nach B bringen und ähnliche Aufgaben.",
    ],
    duBrauchst: [
      "Arbeitshandschuhe, falls du sie beim Aufbau nutzen möchtest",
      "Bequeme Kleidung und festes Schuhwerk",
    ],
    duBekommst: ["Eine Einweisung, wann du wo sein sollst"],
  },
  {
    slug: "fahrer",
    title: "Fahrer:in",
    teaser:
      "Mit dem Auto Material und Dinge entlang der Strecke oder zwischen den Punkten fahren.",
    icon: "directions_car",
    accentBorder: "border-honey-bronze/40",
    accentIcon: "text-honey-bronze",
    accentBg: "bg-honey-bronze/10",
    einleitung: [
      "Du kannst mit deinem Auto Dinge von A nach B fahren – zum Beispiel wenn entlang der Strecke etwas benötigt wird oder zwischen Start-, Ziel- und Einsatzorten transportiert werden muss.",
    ],
    duBrauchst: [
      "Ein eigenes Auto mit ausreichend Platz für die geplanten Transporte",
    ],
    duBekommst: [
      "Einen detaillierten Streckenplan mit markierten Orten, an denen etwas vorbeigebracht werden muss",
      "Einen Parkplatz, von dem aus du starten kannst",
    ],
  },
  {
    slug: "mobile-verpflegung",
    title: "Mobile Verpflegungsstation",
    teaser: "Mit Lastenrad und guter Laune unterwegs",
    icon: "pedal_bike",
    accentBorder: "border-sky-reflection/40",
    accentIcon: "text-baltic-blue",
    accentBg: "bg-sky-reflection/15",
    einleitung: [
      "Du kannst dir vorstellen, mit einem Lastenrad in gemütlichem Tempo die Strecke zu befahren und beispielsweise Wasser anzubieten. Das Lastenrad stellen wir dir.",
    ],
    duBrauchst: [
      "Gute Laune und Freude am Gespräch mit Menschen",
      "Etwas Ausdauer – das Lastenrad hat einen E-Motor und unterstützt dich beim Treten",
    ],
    duBekommst: [
      "Ein Lastenrad – wenn es zeitlich möglich ist, organisieren wir gern eine kurze Testrunde, damit du dich ans Fahren gewöhnen kannst",
    ],
  },
  {
    slug: "mobile-pannenhilfe",
    title: "Mobile Pannenhilfe",
    teaser: "Bei Bedarf zur Stelle fahren und bei Platten helfen",
    icon: "build",
    accentBorder: "border-charcoal-blue-300",
    accentIcon: "text-charcoal-blue",
    accentBg: "bg-charcoal-blue-100",
    einleitung: [
      "Du kannst dir vorstellen, bei Bedarf zu einer Stelle entlang der Strecke zu fahren und Menschen mit platten Reifen zu helfen. Andere Reparaturen bieten wir bewusst nicht an.",
    ],
    duBrauchst: [
      "Ein eigenes Fahrrad",
      "Die Fähigkeit, einen platten Reifen zu wechseln",
    ],
    duBekommst: [
      "Ein Pannenhilfe-Set",
      "Den passenden Schlauch oder passendes Flickzeug",
    ],
  },
];

export const HELFER_ROLLEN_BY_SLUG: Record<string, HelferRolleData> =
  Object.fromEntries(HELFER_ROLLEN.map((r) => [r.slug, r]));
