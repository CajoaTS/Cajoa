// jsdom does not implement scrolling: make it a no-op so tests stay quiet
Object.defineProperty(window, "scrollTo", {
  value: () => {},
  writable: true,
  configurable: true,
});
