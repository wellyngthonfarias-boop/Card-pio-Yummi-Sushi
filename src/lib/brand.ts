import { existsSync } from "node:fs";
import path from "node:path";

export function hasOfficialLogo() {
  return existsSync(path.join(process.cwd(), "public/brand/yummi-sushi-logo.png"));
}
