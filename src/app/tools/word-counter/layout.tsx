import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Counter - Count Words, Characters & Sentences | QuickFigure",
  description:
    "Free online word counter tool. Instantly count words, characters, sentences, paragraphs, and estimate reading time for any text.",
  keywords: [
    "word counter",
    "character counter",
    "sentence counter",
    "reading time",
    "text analysis",
    "online word count",
  ],
  openGraph: {
    title: "Word Counter - QuickFigure",
    description:
      "Free online word counter. Instantly count words, characters, sentences, paragraphs, and reading time.",
    type: "website",
  },
};

export default function WordCounterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
