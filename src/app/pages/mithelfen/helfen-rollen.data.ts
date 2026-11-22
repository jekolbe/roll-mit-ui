/** Helfer-Anmeldung (Vereinscloud ADFC Baden-Württemberg, Deutschland). */
export const HELFER_FORMULAR_URL =
  "https://vcloud.adfc-bw.de/index.php/apps/forms/s/4xwjJ4ZcDfre2reWHiqknEYL";

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
      "Du unterstützt Teilnehmende entlang der Strecke.",
    icon: "traffic",
    accentBorder: "border-baltic-blue/35",
    accentIcon: "text-baltic-blue",
    accentBg: "bg-baltic-blue/10",
    einleitung: [
      "Du wirst zu zweit mit einem weiteren Menschen entlang der Strecke eine kleine Station betreuten. Die Teilnehmenden können dort einen Stempel abholen, Wasser nachfüllen oder mit anderen ins Gespräch kommen.",
      "Du beantwortest Fragen zur Strecke und zum Event. Falls du einmal nicht weiterweist, leitest du die Frage einfach an unsere Hauptkoordination weiter.",
    ],
    duBrauchst: [
      "Eigene Verpflegung (Trinken und Essen) für den Tag",
      "Sonnencreme",
      "Bequeme Kleidung",
      "Ein Handy auf dem wir dich kontaktieren können"
    ],
    duBekommst: [
      "Fahrt zum Einsatzort, falls du nicht selbst hinfahren möchtest",
      "Eine genaue Einweisung, wann du wo sein sollst",
      "Einen Stuhl und einen Tisch",
      "Einen Sonnenschirm"
    ],
  },
  {
    slug: "start-und-ziel",
    title: "Helfer:in am Start- und Zielpunkt",
    teaser:
      "Du sorgst dafür, dass am Start- und Zielpunkt alles reibungslos funktioniert.",
    icon: "event",
    accentBorder: "border-blaze-orange/35",
    accentIcon: "text-blaze-orange",
    accentBg: "bg-blaze-orange/10",
    einleitung: [
      "Du hilfst uns, Start- und Zielpunkt einzurichten. Dazu gehört zum Beispiel: Sitzgelegenheiten aufstellen, Absperrbänder befestigen, Material von A nach B bringen und ähnliche Aufgaben.",
      "Wenn du möchtest, kannst du auch gerne an einem unserer Stände aktiv werden. Beispielsweise können sich die Teilnehmenden kleine Geschenke abholen, wenn sie die ganze Strecke gemeistert haben."
    ],
    duBrauchst: [
      "Arbeitshandschuhe, falls du sie beim Aufbau nutzen möchtest",
      "Bequeme Kleidung und festes Schuhwerk",
      "Eigenes Trinken",
      "Snacks für Zwischendurch"
    ],
    duBekommst: [
      "Ein Mittagessen",
      "Eine Einweisung, wann du wo sein sollst"
    ],
  },
  {
    slug: "fahrer",
    title: "Fahrer:in",
    teaser:
      "Du bringst Material von A nach B.",
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
    teaser: "Du sorgst mit einem Lastenrad für gute Laune und Verpflegung auf der Strecke.",
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
];

export const HELFER_ROLLEN_BY_SLUG: Record<string, HelferRolleData> =
  Object.fromEntries(HELFER_ROLLEN.map((r) => [r.slug, r]));
