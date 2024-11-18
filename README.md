# create-kaplay 🦖

A CLI tool to create a new [KAPLAY](https://kaplayjs.com) project in no time.

It will create a project template using [Vite](https://vitejs.dev), this will
give you:

- A modern setup 🚀
- A fast development server ⚡
- Build for production and generate static assets 🏗️
- A simple and fast bundler 📦
- TypeScript support out of the box 🦄

If you want to package your game for desktop, you can use the `--desktop` option
to enable [Tauri](https://tauri.app) support. Follow the
[Tauri prerequisites guide](https://tauri.app/v1/guides/getting-started/prerequisites)
to get started.

## EXAMPLE

```sh
# quick start with default config
create-kaplay mygame

# calling with options
create-kaplay --typescript --desktop mygame
```

## USAGE

```sh
create-kaplay [OPTIONS] <dir>
```

## OPTIONS

```
-h, --help             Print help message
-t, --typescript       Use TypeScript
-d, --desktop          Enable packaging for desktop release (uses tauri and requires rust to be installed)
-e, --example <name>   Start from an example listed on play.kaplayjs.com
-s  --spaces <level>   Use spaces instead of tabs for generated files
-v, --version <label>  Use a specific kaplay version (default latest)
-verb, --verbose       Print additional information
```

## FAQ

**Q: Why not HMR with Vite?**

A: KAPLAY Games are stateful and live-reloading can break the game state. You
can enable HMR by removing `hmr` key inside `vite.config.js`.
