export function detectPackageManager() {
    if (!process.env.npm_config_user_agent) return;
    const specifier = process.env.npm_config_user_agent.split(" ")[0];
    const name = specifier.substring(0, specifier.lastIndexOf("/"));
    return name === "npminstall" ? "cnpm" : name;
}

export const packageInstalls = {
    "npm": "install",
    "yarn": "add",
    "pnpm": "install",
    "bun": "install",
};

export const packageRunScripts = (script: string) => ({
    "npm": `run ${script}`,
    "yarn": `run ${script}`,
    "pnpm": `${script}`,
    "bun": `${script}`,
});

export const packageExecutions = {
    "npm": `npx`,
    "yarn": `yarn`,
    "pnpm": `pnpm`,
    "bun": `bunx`,
};
