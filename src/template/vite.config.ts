import { defineConfig } from "vite";

const kaplayCongrats = () => {
    return {
        name: "vite-plugin-kaplay-hello",
        buildEnd() {
            const line =
                "---------------------------------------------------------";
            const msg = `🦖 Awesome pal! Send your game to us:\n\n💎 Discord: https://discord.com/invite/aQ6RuQm3TF \n💖 Donate to KAPLAY: https://opencollective.com/kaplay\n\ (you can disable this msg on vite.config)`;

            process.stdout.write(`\n${line}\n${msg}\n${line}\n`);
        },
    };
};

export default defineConfig(({ mode }) => ({
    // index.html out file will start with a relative path for script
    base: "./",
    server: {
        port: 3001,
    },
    build: {
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
        // Disable messages removing this line
        kaplayCongrats(),
    ],
}));
