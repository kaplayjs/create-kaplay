import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
    // Paths like the script src will be relative in the output index.html
    // Recommended when publishing on sites like itch.io
    base: "./",
    server: {
        port: 3001,
    },
    build: {
        // Set to true if you want to allow anyone to read or debug the source code after publishing
        sourcemap: mode !== "production",
        rolldownOptions: {
            output: {
                codeSplitting: {
                    groups: [
                        {
                            name: "kaplay",
                            test: /node_modules[\\/]kaplay/,
                        },
                    ],
                },
            },
        },
    },
    plugins: [
        // Disable messages by removing this line
        kaplayCongrats(),
    ],
}));

function kaplayCongrats() {
    return {
        name: "vite-plugin-kaplay-hello",
        buildEnd() {
            const line =
                "---------------------------------------------------------";
            const msg = `🦖 Awesome pal! Send your game to us:\n\n💎 Discord: https://discord.com/invite/aQ6RuQm3TF \n💖 Donate to KAPLAY: https://opencollective.com/kaplay\n\ (you can disable this msg in vite.config)`;

            process.stdout.write(`\n${line}\n${msg}\n${line}\n`);
        },
    };
};
