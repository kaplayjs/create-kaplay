import { node } from "@liuli-util/vite-plugin-node";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [node()],
    appType: "custom",
});
