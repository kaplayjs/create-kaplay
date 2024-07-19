type PackageManager = "npm" | "yarn" | "pnpm" | "bun" | "cnpm";

export function detectPackageManager(): PackageManager {
    if (!process.env.npm_config_user_agent) return;
    const specifier = process.env.npm_config_user_agent.split(" ")[0];
    const name = specifier.substring(0, specifier.lastIndexOf("/"));

    if (name === "npminstall") return "cnpm";

    return name as PackageManager;
}

export const packageInstalls = {
    "npm": "install",
    "yarn": "add",
    "pnpm": "install",
    "bun": "install",
    "cnpm": "install",
};

export const packageRunScripts = (script: string) => ({
    "npm": `run ${script}`,
    "yarn": `${script}`,
    "pnpm": `run ${script}`,
    "bun": `run ${script}`,
    "cnpm": `run ${script}`,
});

export const packageExecutions = {
    "npm": `npx`,
    "yarn": `yarn`,
    "pnpm": `pnpm`,
    "bun": `bunx`,
    "cnpm": `cnpm`,
};
