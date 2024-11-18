import { defineConfig } from "vite";

export default defineConfig({
    // index.html out file will start with a relative path for script
    base: "./",
    build: {
        // disable this for low bundle size
        sourcemap: true,
    },
});
