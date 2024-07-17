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
