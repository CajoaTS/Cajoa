export type Lang = "tsx" | "ts" | "json" | "bash" | "text";

const KEYWORDS = new Set([
  "import",
  "from",
  "export",
  "default",
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "new",
  "async",
  "await",
  "type",
  "interface",
  "extends",
  "as",
  "of",
  "in",
  "class",
  "typeof",
  "true",
  "false",
  "null",
  "undefined",
]);

// Groups: 1 comment, 2 string, 3 number, 4 word
const CODE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

// Groups: 1 comment, 2 string, 3 flag, 4 command
const SHELL =
  /(#[^\n]*)|("(?:\\.|[^"\\\n])*"|'[^'\n]*')|(\B--?[A-Za-z][\w-]*)|(\b(?:npm|npx|cd|git|node)\b)/g;

function classOf(lang: Lang, m: RegExpExecArray): string | null {
  if (m[1]) return "c";
  if (m[2]) return "s";
  if (lang === "bash") return m[3] ? "n" : m[4] ? "k" : null;
  if (m[3]) return "n";
  if (KEYWORDS.has(m[4])) return "k";
  return /^[A-Z]/.test(m[4]) ? "t" : null;
}

/** Turns code into text and <span> elements. It works on the server and in the browser. */
export function highlight(code: string, lang: Lang): unknown[] {
  if (lang === "text") return [code];

  const re = new RegExp((lang === "bash" ? SHELL : CODE).source, "g");
  const out: unknown[] = [];
  let plain = "";
  let last = 0;

  for (let m = re.exec(code); m; m = re.exec(code)) {
    plain += code.slice(last, m.index);
    const cls = classOf(lang, m);
    if (cls) {
      if (plain) out.push(plain);
      plain = "";
      out.push(<span class={"tok-" + cls}>{m[0]}</span>);
    } else {
      plain += m[0];
    }
    last = m.index + m[0].length;
  }

  plain += code.slice(last);
  if (plain) out.push(plain);
  return out;
}
