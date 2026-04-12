import { existsSync } from "node:fs";
import { delimiter } from "node:path";

export function envFlag(name: string) {
  const value = process.env[name]?.trim();
  return Boolean(value);
}

export function commandExists(command: string) {
  const pathValue = process.env.PATH;
  if (!pathValue) {
    return false;
  }

  const names = process.platform === "win32"
    ? [command, `${command}.exe`, `${command}.cmd`, `${command}.bat`]
    : [command];

  for (const basePath of pathValue.split(delimiter)) {
    for (const name of names) {
      if (existsSync(`${basePath}/${name}`)) {
        return true;
      }
    }
  }

  return false;
}
