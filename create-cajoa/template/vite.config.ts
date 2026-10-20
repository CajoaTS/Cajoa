import { defineConfig } from "vite";
import { cajoa } from "cajoa/vite";

export default defineConfig({
  plugins: [cajoa()],
});
