const windowsPathReg = /\\/g;
export const normalizePath = (id: string) => id.replace(windowsPathReg, "/");
