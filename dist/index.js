#!/usr/bin/env node
import T from "node:child_process";
import { detect as C } from "detect-package-manager";
import m from "node:fs";
import W from "node:https";
import x from "node:path";
const I = {
  npm: "install",
  yarn: "add",
  pnpm: "install",
  bun: "install"
}, M = (e) => ({
  npm: `run ${e}`,
  yarn: `run ${e}`,
  pnpm: `${e}`,
  bun: `${e}`
}), U = "2.6.3", a = await C(), E = I[a], _ = M("dev")[a], k = "https://raw.githubusercontent.com/marklovers/kaplay/master", z = process.cwd(), c = (e, t) => `\x1B[${e}m${t}\x1B[0m`, S = /^win/.test(process.platform), g = (e, t) => {
  console.error(c(31, e)), t && console.error(`
` + b), process.exit(1);
}, p = (e) => console.log(c(33, e)), D = [
  { long: "help", short: "h", desc: "Print this message" },
  { long: "typescript", short: "t", desc: "Use TypeScript" },
  {
    long: "desktop",
    short: "d",
    desc: "Enable packaging for desktop with tauri"
  },
  {
    long: "example",
    short: "e",
    value: "name",
    desc: "Start from an example listed on play.kaplayjs.com"
  },
  {
    long: "spaces",
    short: "s",
    value: "level",
    desc: "Use spaces instead of tabs for generated files"
  },
  {
    long: "version",
    short: "v",
    value: "label",
    desc: "Use a specific kaplay version (default latest)"
  }
], O = D.map((e) => ({
  usage: `${e.short ? `-${e.short},` : "   "} --${e.long}${e.value ? ` <${e.value}>` : ""}`,
  desc: e.desc
})), B = O.reduce((e, t) => t.usage.length > e ? t.usage.length : e, 0), b = `
create-kaplay v${U} ${a}

${c(32, "USAGE 🦖")}

  $ create-kaplay [OPTIONS] <dir>

${c(32, "OPTIONS")}

  ${O.map((e) => `${c(32, e.usage)} ${" ".repeat(B - e.usage.length)} ${e.desc}`).join(`
  `)}

${c(32, "EXAMPLE")}
  ${c(90, "# quick start with default config")}
  $ create-kaplay my-game

  ${c(
  90,
  "# calling with options"
)}
  $ create-kaplay --typescript --spaces 4 --desktop --example burp my-game
`.trim(), i = {}, P = [];
e: for (let e = 2; e < process.argv.length; e++) {
  const t = process.argv[e];
  if (t.startsWith("-")) {
    for (const s of D)
      if (t === `--${s.long}` || t === `-${s.short}`) {
        if (s.value) {
          const o = process.argv[++e];
          o || g(`Expected value after ${t}`), i[s.long] = o;
        } else
          i[s.long] = !0;
        continue e;
      }
    g(`Unknown option "${t}"`, !0);
  } else
    P.push(t);
}
i.help && (console.log(b), process.exit());
const n = P[0];
n || (console.log(b), process.exit());
m.existsSync(n) && g(`Directory "${n}" already exists!`);
const y = (e) => JSON.stringify(e, null, i.spaces ? 4 : "	"), h = i.typescript, u = i.desktop, w = h ? "ts" : "js", v = async (e, t) => new Promise((s) => {
  const o = m.createWriteStream(t);
  W.get(e, (l) => {
    l.pipe(o), o.on("finish", () => {
      o.close(), s();
    });
  });
}), f = async (e, t, s) => new Promise((o) => {
  const l = T.spawn(S ? e + ".cmd" : e, t, {
    ...s,
    ...S ? { shell: !0 } : {}
  });
  l.on("exit", o), l.on("error", g);
}), J = (e, t) => {
  const s = JSON.parse(m.readFileSync(e, "utf8"));
  m.writeFileSync(e, y(t(s)));
};
let $ = `
import kaplay from "kaplay";
import "kaplay/global";

const k = kaplay()

k.loadSprite("bean", "sprites/bean.png")

k.add([
	k.pos(120, 80),
	k.sprite("bean"),
])

k.onClick(() => k.addKaboom(k.mousePos()))
`.trim();
const A = /load(Sprite|Sound|Shader|Aseprite|Font|BitmapFont)\("([^"]+)",\s*"([^"]+)"\)/gm;
i.example && (p(`- fetching example "${i.example}"`), $ = `import kaplay from "kaplay"
import "kaplay/global";

` + await (await fetch(`${k}/examples/${i.example}.js`)).text());
const j = [];
for (const e of $.matchAll(A)) {
  const [t, s, o, l] = e;
  l.startsWith("/sprites") || j.includes(l.split("/")[2]) || j.push(l.split("/")[2]);
}
const F = [
  `kaplay@${i.version ?? "latest"}`
], R = [
  "vite@latest",
  ...h ? ["typescript@latest"] : [],
  ...u ? ["@tauri-apps/cli@latest"] : []
], d = (e, t) => ({
  type: "file",
  name: e,
  content: t.trim()
}), r = (e, t) => ({
  type: "dir",
  name: e,
  items: t
}), N = (e) => {
  if (e.type === "dir")
    m.mkdirSync(e.name), process.chdir(e.name), e.items.forEach(N), process.chdir("..");
  else if (e.type === "file") {
    const t = i.spaces ? e.content.replaceAll("	", " ".repeat(i.spaces)) : e.content, s = process.cwd().replace(new RegExp(`^${z}/`), "");
    p(`- creating ${s}/${e.name}`), m.writeFileSync(e.name, t);
  }
};
N(r(n, [
  d(
    "package.json",
    y({
      name: n,
      scripts: {
        build: "vite build",
        dev: "vite",
        bundle: `${a} run build && mkdir -p dist && zip -r dist/game.zip www -x "**/.DS_Store"`,
        ...h ? {
          check: "tsc"
        } : {},
        ...u ? {
          "dev:desktop": "tauri dev",
          "build:desktop": "tauri build"
        } : {}
      }
    })
  ),
  d(
    "index.html",
    `
<!DOCTYPE html>
<html>
<head>
<title>${n}</title>
</head>
<body style="overflow:hidden">
<script src="src/main.${w}" type="module"><\/script>
</body>
</html>
    `
  ),
  r("public", [
    r("sprites", []),
    // TODO: Create this folders if only needed
    r("examples", [
      r("sprites", []),
      r("sounds", []),
      r("fonts", []),
      r("shaders", [])
    ])
  ]),
  r("src", [
    d(`main.${w}`, $)
  ]),
  d("README.md", ""),
  ...h ? [
    d(
      "tsconfig.json",
      y({
        compilerOptions: {
          noEmit: !0,
          target: "esnext",
          moduleResolution: "node"
        },
        include: [
          "src/**/*.ts"
        ]
      })
    )
  ] : [],
  d(
    ".gitignore",
    `
node_modules/
www/main.js
dist/
${u ? "src-tauri/target/" : ""}
	`
  ),
  d(
    "README.md",
    `
# Folder structure

- \`src\` - source code for your kaplay project
- \`www\` - distribution folder, contains your index.html, built js bundle and static assets
${u ? "- `src-tauri` - tauri project folder, contains tauri config file, icons, rust source if you need native code" : ""}

## Development

\`\`\`sh
$ ${a} run dev
\`\`\`

will start a dev server at http://localhost:8000

## Distribution

\`\`\`sh
$ ${a} run build
\`\`\`

will build your js files into \`www/main.js\`

\`\`\`sh
$ ${a} run bundle
\`\`\`

will build your game and package into a .zip file, you can upload to your server or itch.io / newground etc.

${u ? `
## Desktop

This project uses tauri for desktop builds, you have to have \`rust\` installed on your system for desktop to work, check out [tauri setup guide](https://tauri.app/v1/guides/getting-started/prerequisites/)

For tauri native APIs look [here](https://tauri.app/v1/api/js/)

\`\`\`sh
$ ${a} run dev:desktop
\`\`\`

will start the dev server and a native window that servers content from that dev server

\`\`\`sh
$ ${a} run build:desktop
\`\`\`

will create distributable native app package
` : ""}
	`
  )
]));
process.chdir(n);
p("- downloading example sprites");
for (const e of $.matchAll(A)) {
  const [, t, s, o] = e;
  o.startsWith("sprites") || o.startsWith("/sprites") ? (p(`- downloading sprite "${s}"`), await v(
    `${k}/assets/${o}`,
    x.join("public", o)
  )) : (p(`- downloading ${t.toLowerCase()} "${s}"`), await v(
    `${k}/examples/${o}`,
    x.join("public", o)
  ));
}
p(`- installing packages ${F.map((e) => `"${e}"`).join(", ")}`);
await f(a, [E, ...F], {
  stdio: ["inherit", "ignore", "inherit"]
});
p(
  `- installing dev packages ${R.map((e) => `"${e}"`).join(", ")}`
);
await f(a, [E, "-D", ...R], {
  stdio: ["inherit", "ignore", "inherit"]
});
u && (p("- starting tauri project for desktop build"), await f("npx", [
  "tauri",
  "init",
  "--app-name",
  n,
  "--window-title",
  n,
  "--dist-dir",
  "../www",
  "--dev-path",
  "http://localhost:8000",
  "--before-dev-command",
  "npm run dev",
  "--before-build-command",
  "npm run build",
  "--ci"
], { stdio: "inherit" }), await v(
  "https://raw.githubusercontent.com/marklovers/kaplay/master/assets/sprites/k.png",
  "public/icon.png"
), await f("npx", ["tauri", "icon", "public/icon.png"], { stdio: "inherit" }), J("src-tauri/tauri.conf.json", (e) => (e.tauri.bundle.identifier = "com.kaplay.dev", e)));
console.log("");
console.log(`
Success! Now

  $ cd ${n}
  $ ${a} ${_}

and start editing src/main.${w}!
`.trim());
