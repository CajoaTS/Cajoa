export const REPO = "https://github.com/CajoaTS/Cajoa";

/** Adds the base path to a file in the public folder, for example asset("logo.png"). */
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, "");

/** Makes a safe id from a heading or a name. */
export const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");