import type { ScreenKey } from "../types/game";

export interface LevelDefinition {
  id: string;
  title: string;
  description: string;
  screen: ScreenKey;
  accent: "blue" | "green" | "amber" | "red" | "purple";
  section?: string;
  isBoss?: boolean;
}

export const levels: LevelDefinition[] = [
  {
    id: "section-6-1",
    title: "6.1 Ontdekkingsreizen en wereldhandel",
    description: "Waarom gingen Europeanen op reis en hoe ontstond wereldhandel?",
    section: "6.1 Ontdekkingsreizen en wereldhandel",
    screen: "quiz",
    accent: "blue",
  },
  {
    id: "section-6-2",
    title: "6.2 Nieuwe ideeën en de hervorming",
    description: "Humanisme, kritiek op de kerk en het ontstaan van nieuwe kerken.",
    section: "6.2 Nieuwe ideeën en de hervorming",
    screen: "quiz",
    accent: "green",
  },
  {
    id: "section-6-3",
    title: "6.3 De Nederlanden komen in opstand",
    description: "Filips II, protestanten, hagenpreken en het begin van de Opstand.",
    section: "6.3 De Nederlanden komen in opstand",
    screen: "quiz",
    accent: "amber",
  },
  {
    id: "section-6-4",
    title: "6.4 Van opstand naar nieuw land",
    description: "Van Plakkaat van Verlatinghe naar Republiek en vrede.",
    section: "6.4 Van opstand naar nieuw land",
    screen: "timeline",
    accent: "red",
  },
  {
    id: "terms-mix",
    title: "Begrippenmix hoofdstuk 6",
    description: "Herhaal de kernbegrippen van ontdekkers, hervormers en opstand.",
    section: "Begrippenmix hoofdstuk 6",
    screen: "terms",
    accent: "green",
  },
  {
    id: "boss-level",
    title: "Boss Level",
    description: "Gemengde eindronde met moeilijke vragen uit het hele hoofdstuk.",
    screen: "boss",
    accent: "purple",
    isBoss: true,
  },
];
