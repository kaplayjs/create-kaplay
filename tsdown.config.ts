import rawPlugin from "unplugin-raw/rollup";
import { defineConfig } from "tsdown";

export default defineConfig({
    plugins: [rawPlugin()],
});
