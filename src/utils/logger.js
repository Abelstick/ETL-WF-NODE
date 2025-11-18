import fs from "fs";
import path from "path";

export function writeLog(name, content) {
  const filePath = path.join("logs", `${name}-${Date.now()}.txt`);
  fs.writeFileSync(filePath, content);
  return filePath;
}
