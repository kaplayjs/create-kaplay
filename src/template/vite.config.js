import { defineConfig } from "vite";

const kaplayCongrats = () => {
    return {
        name: 'vite-plugin-kaplay-hello',
        buildEnd() {
            const line = "---------------------------------------------------------";
            const msg = `🦖 Awesome pal! Send your game to us:\n\n💎 Discord: https://discord.com/invite/aQ6RuQm3TF \n💖 Donate to KAPLAY: https://opencollective.com/kaplay\n\ (you can disable this msg on vite.config)`;
            process.stdout.write(`${line}\n${msg}\n${line}\n`);
            
            process.stdout.write(`✨ Done ✨\n`);
        }
    }
}   


export default defineConfig({
    // index.html out file will start with a relative path for script
    base: "./",
    build: {
        // disable this for low bundle sizes
        sourcemap: true,
    },
    port: 3001,
    plugins: [
        // Disable messages removing this line
        kaplayCongrats(),
    ],

});
