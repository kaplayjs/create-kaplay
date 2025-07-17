#!/usr/bin/env node
import {
    detectPackageManager,
    packageExecutions,
    packageInstalls,
    packageRunScripts,
} from "./packageManagers.ts";
import mainJsContent from "./template/src/main.js?raw";
import viteConfigContent from "./template/vite.config.js?raw";

import cp from "child_process";
import fs from "fs";
import https from "https";
import path from "path";

const VERSION = "3.1.0";

const packageManager = detectPackageManager() ?? "npm";
const packageExec = packageExecutions[packageManager];
const installCmd = packageInstalls[packageManager];
const devCmd = packageRunScripts("dev")[packageManager];

const kaplayRepo = `https://raw.githubusercontent.com/kaplayjs/kaplay/master/examples`;
const cwd = process.cwd();

const c = (n: number, msg: string) => `\x1b[${n}m${msg}\x1b[0m`;

const isWindows = /^win/.test(process.platform);

const fail = (msg: string, ifHelp?: boolean) => {
    console.error(c(31, msg));
    if (ifHelp) console.error("\n" + help);
    process.exit(1);
};

const info = (msg: string) => console.log(c(33, msg));
const debug = (msg: string) => {
    if (opts["verbose"]) {
        console.log(c(90, msg));
    }
};

const wrapArg = (arg: string) => {
    if (isWindows) {
        return `"${arg}"`;
    }

    return arg;
};

const optMap = [
    { long: "help", short: "h", desc: "Print this message" },
    { long: "typescript", short: "t", desc: "Use TypeScript" },
    {
        long: "desktop",
        short: "d",
        desc: "Enable packaging for desktop with tauri",
    },
    {
        long: "example",
        short: "e",
        value: "name",
        desc: "Start from an example listed on play.kaplayjs.com",
    },
    {
        long: "spaces",
        short: "s",
        value: "level",
        desc: "Use spaces instead of tabs for generated files",
    },
    {
        long: "version",
        short: "v",
        value: "label",
        desc: "Use a specific kaplay version (default latest)",
    },
    {
        long: "verbose",
        short: "verb",
        desc: "Print additional information",
    },
];

// constructing help msg
const optDisplay = optMap.map((opt) => ({
    usage: `${opt.short ? `-${opt.short},` : "   "} --${opt.long}${
        opt.value ? ` <${opt.value}>` : ""
    }`,
    desc: opt.desc,
}));

const usageLen = optDisplay.reduce(
    (len, dis) => (dis.usage.length > len ? dis.usage.length : len),
    0
);

const help = `
create-kaplay v${VERSION} ${packageManager}

${c(32, "USAGE 🦖")}

  $ create-kaplay [OPTIONS] <dir>

${c(32, "OPTIONS")}

  ${optDisplay
      .map(
          (opt) =>
              `${c(32, opt.usage)} ${" ".repeat(usageLen - opt.usage.length)} ${
                  opt.desc
              }`
      )
      .join("\n  ")}

${c(32, "EXAMPLE")}
  ${c(90, "# quick start with default config")}
  $ create-kaplay my-game

  ${c(90, "# calling with options")}
  $ create-kaplay --typescript --spaces 4 --desktop --example burp my-game
`.trim();

const opts = {};
const args: string[] = [];

// process opts and args
iterargs: for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith("-")) {
        for (const opt of optMap) {
            if (arg === `--${opt.long}` || arg === `-${opt.short}`) {
                if (opt.value) {
                    const val = process.argv[++i];
                    if (!val) {
                        fail(`Expected value after ${arg}`);
                    }
                    opts[opt.long] = val;
                } else {
                    opts[opt.long] = true;
                }
                continue iterargs;
            }
        }
        fail(`Unknown option "${arg}"`, true);
    } else {
        args.push(arg);
    }
}

if (opts["help"]) {
    console.log(help);
    process.exit();
}

const dest = args[0];

// TODO: interactive creation
if (!dest) {
    console.log(help);
    process.exit();
}

if (fs.existsSync(dest)) {
    fail(`Directory "${dest}" already exists!`);
}

const stringify = (obj) => JSON.stringify(obj, null, opts["spaces"] ? 4 : "\t");
const ts = opts["typescript"];
const desktop = opts["desktop"];
const ext = ts ? "ts" : "js";

const download = async (url: string, to: string) =>
    new Promise<void>((resolve, reject) => {
        const file = fs.createWriteStream(to);
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(res.statusMessage);
            }
            res.pipe(file);
            file.on("finish", () => {
                file.close();
                resolve();
            });
        });
    });

const request = async (opt) =>
    new Promise((resolve) => {
        const req = https.request(opt, (res) => {
            res.on("data", resolve);
        });
        req.on("error", fail);
        req.end();
    });

const exec = async (cmd, args, opts) => {
    debug(`- running ${cmd} ${args.join(" ")}`);

    return new Promise((resolve) => {
        const proc = cp.spawn(cmd, args, {
            ...opts,
            ...(isWindows ? { shell: true } : {}),
        });

        debug(`- spawned process ${proc.pid} ${cmd} ${args.join(" ")}`);

        proc.on("exit", resolve);
        proc.on("error", fail);
    });
};

const updateJSONFile = (path, action) => {
    const json = JSON.parse(fs.readFileSync(path, "utf8"));
    fs.writeFileSync(path, stringify(action(json)));
};

let startCode = mainJsContent;

const assetsRegex =
    /load(Sprite|Sound|Shader|Aseprite|Font|BitmapFont)\("([^"]+)",\s*"([^"]+)"\)/gm;

if (opts["example"]) {
    info(`- fetching example "${opts["example"]}"`);

    const example = await fetch(`${kaplayRepo}/${opts["example"]}.js`);
    const exampleText = await example.text();

    if (!example.ok) {
        fail(
            `Example "${opts["example"]}" not found. Check https://github.com/kaplayjs/kaplay/tree/master/examples for available examples`
        );
    }

    startCode =
        'import kaplay from "kaplay"\nimport "kaplay/global";\n\n' +
        exampleText;
}

// get assets
const folders: string[] = [];

for (const match of startCode.matchAll(assetsRegex)) {
    const [_idk, _type, _name, url] = match;

    if (url.startsWith("/sprites")) continue;

    if (!folders.includes(url.split("/")[2])) {
        folders.push(url.split("/")[2]);
    }
}

const pkgs = [`kaplay@${opts["version"] ?? "latest"}`];

const devPkgs = [
    "vite@latest",
    "@types/node@latest",
    ...(ts ? ["typescript@latest"] : []),
    ...(desktop ? ["@tauri-apps/cli@1"] : []),
];

const file = (name, content) => ({
    type: "file",
    name,
    content: content.trim(),
});

const dir = (name, items) => ({
    type: "dir",
    name,
    items,
});

const create = (item) => {
    if (item.type === "dir") {
        fs.mkdirSync(item.name);
        process.chdir(item.name);
        item.items.forEach(create);
        process.chdir("..");
    } else if (item.type === "file") {
        const content = opts["spaces"]
            ? item.content.replaceAll("\t", " ".repeat(opts["spaces"]))
            : item.content;
        const dir = process.cwd().replace(new RegExp(`^${cwd}/`), "");
        info(`- creating ${dir}/${item.name}`);
        fs.writeFileSync(item.name, content);
    }
};

// generate core files
create(
    dir(dest, [
        file(
            "package.json",
            stringify({
                name: dest,
                type: "module",
                scripts: {
                    build: `vite build`,
                    dev: `vite`,
                    preview: `vite preview`,
                    zip: `${packageManager} run build && mkdir -p dist && zip -r dist/game.zip dist -x \"**/.DS_Store\"`,
                    ...(ts
                        ? {
                              check: "tsc",
                          }
                        : {}),
                    ...(desktop
                        ? {
                              "dev:desktop": "tauri dev",
                              "build:desktop": "tauri build",
                          }
                        : {}),
                },
            })
        ),
        file(`vite.config.${ext}`, viteConfigContent),
        file(
            "index.html",
            `
<!DOCTYPE html>
<html>
<head>
<title>${dest}</title>
</head>
<body style="overflow:hidden">
<script src="src/main.${ext}" type="module"></script>
</body>
</html>
    `
        ),
        dir("public", [
            dir("sprites", []),
            // TODO: Create this folders if only needed
            dir("examples", [
                dir("sprites", []),
                dir("sounds", []),
                dir("fonts", []),
                dir("shaders", []),
            ]),
        ]),
        dir("src", [file(`main.${ext}`, startCode)]),
        file("README.md", ""),
        ...(ts
            ? [
                  file(
                      "tsconfig.json",
                      stringify({
                          compilerOptions: {
                              noEmit: true,
                              target: "esnext",
                              moduleResolution: "node",
                          },
                          include: ["src/**/*.ts"],
                      })
                  ),
              ]
            : []),
        file(
            ".gitignore",
            `
node_modules/
dist/
.DS_Store
${desktop ? "src-tauri/target/" : ""}
	`
        ),
        file(
            "README.md",
            `
# Folder structure

- \`src\` - source code for your kaplay project
- \`dist\` - distribution folder, contains your index.html, built js bundle and static assets
${
    desktop
        ? "- `src-tauri` - tauri project folder, contains tauri config file, icons, rust source if you need native code"
        : ""
}

## Development

\`\`\`sh
$ ${packageManager} run dev
\`\`\`

will start a dev server at http://localhost:8000

## Distribution

\`\`\`sh
$ ${packageManager} run build
\`\`\`

will build your js files into \`dist/\`

\`\`\`sh
$ ${packageManager} run zip
\`\`\`

will build your game and package into a .zip file, you can upload to your server or itch.io / newground etc.

${
    desktop
        ? `
## Desktop

This project uses tauri for desktop builds, you have to have \`rust\` installed on your system for desktop to work, check out [tauri setup guide](https://tauri.app/v1/guides/getting-started/prerequisites/)

For tauri native APIs look [here](https://tauri.app/v1/api/js/)

\`\`\`sh
$ ${packageManager} run dev:desktop
\`\`\`

will start the dev server and a native window that servers content from that dev server

\`\`\`sh
$ ${packageManager} run build:desktop
\`\`\`

will create distributable native app package
`
        : ""
}
	`
        ),
    ])
);

process.chdir(dest);

info("- downloading example sprites");

for (const match of startCode.matchAll(assetsRegex)) {
    const [, type, name, url] = match;

    const fullUrl = path.join(kaplayRepo, url);

    if (
        url.startsWith("sprites") ||
        url.startsWith("/sprites") ||
        url.startsWith("./sprites")
    ) {
        info(`- downloading sprite "${name}"`);
        debug(`- sprite full url: ${fullUrl}`);

        try {
            await download(fullUrl, path.join("public", url));
        } catch (error) {
            info(`- error while downloading sprite "${name}"`);
            debug(`- error: ${error}`);
        }
    } else {
        info(`- downloading ${type.toLowerCase()} "${name}"`);
        debug(`- ${type.toLowerCase()} full url: ${fullUrl}`);

        try {
            await download(fullUrl, path.join("public", "examples", url));
        } catch (error) {
            info(`- error while downloading ${type.toLowerCase()} "${name}"`);
            debug(`- error: ${error}`);
        }
    }
}

info(`- installing packages ${pkgs.map((pkg) => `"${pkg}"`).join(", ")}`);
await exec(packageManager, [installCmd, ...pkgs], {
    stdio: ["inherit", "ignore", "inherit"],
});
info(
    `- installing dev packages ${devPkgs.map((pkg) => `"${pkg}"`).join(", ")}`
);
await exec(packageManager, [installCmd, "-D", ...devPkgs], {
    stdio: ["inherit", "ignore", "inherit"],
});

if (desktop) {
    info("- starting tauri project for desktop build");

    debug(`- running ${packageManager} tauri init`);

    await exec(
        packageExec,
        [
            "tauri",
            "init",
            "--app-name",
            dest,
            "--window-title",
            dest,
            "--dist-dir",
            "../dist",
            "--dev-path",
            "http://localhost:8000",
            "--before-dev-command",
            wrapArg(`${packageManager} run dev`),
            "--before-build-command",
            wrapArg(`${packageManager} run build`),
            "--ci",
        ],
        { stdio: "inherit" }
    );

    try {
        await download(
            "https://raw.githubusercontent.com/kaplayjs/kaplay/master/examples/sprites/k.png",
            "public/icon.png"
        );
    } catch (error) {
        info(`- error while downloading icon`);
        debug(`- error: ${error}`);
    }

    await exec(packageExec, ["tauri", "icon", "public/icon.png"], {
        stdio: "inherit",
    });

    updateJSONFile("src-tauri/tauri.conf.json", (cfg) => {
        cfg.tauri.bundle.identifier = "com.kaplay.dev";
        return cfg;
    });
}

console.log("");
console.log(
    `
Success! Now run:

$ cd ${dest}
$ ${packageManager} ${devCmd}

and start editing src/main.${ext}! 🦖
--------------------------------------------
Consider donating to KAPLAY:
💖 https://opencollective.com/kaplay
`.trim()
);
