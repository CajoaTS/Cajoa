import { apiRows } from "./content/api";
import { pages } from "./pages";
import { slug } from "./site";

export interface Entry {
  title: string;
  text: string;
  href: string;
  kind: "Guide" | "API";
}

const guides: Entry[] = pages.map(
  (page): Entry => ({
    title: page.title,
    text: page.description + " " + page.keywords,
    href: "/docs/" + page.slug,
    kind: "Guide",
  }),
);

const api: Entry[] = apiRows.map(
  ([name, text]): Entry => ({
    title: name,
    text,
    href: "/docs/api#" + slug(name),
    kind: "API",
  }),
);

const entries: Entry[] = [...guides, ...api];

/** Every word must match. A match in the title counts more than a match in the text. */
export function search(query: string): Entry[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return guides;

  return entries
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const text = entry.text.toLowerCase();
      let score = 0;
      for (const word of words) {
        if (title.startsWith(word)) score += 6;
        else if (title.includes(word)) score += 4;
        else if (text.includes(word)) score += 1;
        else return { entry, score: 0 };
      }
      return { entry, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((result) => result.entry);
}