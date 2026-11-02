import { Plugin } from 'vite';

interface CajoaPluginOptions {
    importSource?: string;
}
declare function cajoa(options?: CajoaPluginOptions): Plugin;

export { cajoa };
export type { CajoaPluginOptions };
