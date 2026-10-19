import { test, expect } from "vitest";
import { createSignal } from "cajoa";

const SVG_NS = "http://www.w3.org/2000/svg";
const HTML_NS = "http://www.w3.org/1999/xhtml";

test("svg tags are created in the SVG namespace", () => {
  const svg = (
    <svg>
      <circle />
      <linearGradient />
    </svg>
  ) as SVGElement;

  expect(svg.namespaceURI).toBe(SVG_NS);

  const [circle, gradient] = Array.from(svg.children);
  expect(circle.namespaceURI).toBe(SVG_NS);
  expect(gradient.namespaceURI).toBe(SVG_NS);
  expect(gradient.tagName).toBe("linearGradient"); // nananatili ang uppercase
});

test("viewBox keeps its case and camelCase aliases become kebab-case", () => {
  const svg = (
    <svg viewBox="0 0 10 10" className="icon">
      <circle cx="5" cy="5" r="4" strokeWidth="2" fill-opacity="0.5" />
    </svg>
  ) as SVGElement;
  const circle = svg.children[0];

  expect(svg.getAttribute("viewBox")).toBe("0 0 10 10");
  expect(svg.getAttribute("class")).toBe("icon");
  expect(circle.getAttribute("stroke-width")).toBe("2");
  expect(circle.hasAttribute("strokeWidth")).toBe(false);
  expect(circle.getAttribute("fill-opacity")).toBe("0.5");
});

test("svg attributes can be reactive", () => {
  const [radius, setRadius] = createSignal(4);
  const svg = (
    <svg>
      <circle r={radius} />
    </svg>
  ) as SVGElement;
  const circle = svg.children[0];

  expect(circle.namespaceURI).toBe(SVG_NS);
  expect(circle.getAttribute("r")).toBe("4");

  setRadius(9);
  expect(circle.getAttribute("r")).toBe("9");
});

test("foreignObject keeps HTML children in the HTML namespace", () => {
  const svg = (
    <svg>
      <foreignObject>
        <div>hello</div>
      </foreignObject>
    </svg>
  ) as SVGElement;
  const foreign = svg.children[0];
  const div = foreign.children[0];

  expect(foreign.namespaceURI).toBe(SVG_NS);
  expect(foreign.tagName).toBe("foreignObject");
  expect(div.namespaceURI).toBe(HTML_NS);
});
