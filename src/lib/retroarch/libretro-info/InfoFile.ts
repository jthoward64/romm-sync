export class InfoFile {
  constructor(public elements: InfoFileElement[], public name: string) {}
}

export class InfoFileElement {
  constructor(
    public name: string,
    public value: string | number,
    public precedingComment?: string
  ) {}
}

export function parseInfoFile(content: string, fileName: string): InfoFile {
  const lines = content.split("\n");
  const infoFile = new InfoFile([], fileName);

  let currentComment: string | undefined;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) {
      continue;
    }
    if (trimmedLine.startsWith("#")) {
      // This is a comment line
      currentComment = trimmedLine.slice(1).trim();
      continue;
    }

    const equalsIndex = trimmedLine.indexOf("=");
    if (equalsIndex === -1) {
      throw new Error(`Invalid line format in ${fileName}: ${trimmedLine}`);
    }

    const name = trimmedLine.substring(0, equalsIndex).trim();
    const rawValue = trimmedLine.substring(equalsIndex + 1).trim();

    if (name.length === 0) {
      throw new Error(`Invalid name format in ${fileName}: ${name}`);
    }

    let value: string | number = rawValue;
    if (!isNaN(Number(rawValue))) {
      value = Number(rawValue);
    }
    if (typeof value === "string") {
      if (value.startsWith('"')) {
        value = value.slice(1);
      }
      if (value.endsWith('"')) {
        value = value.slice(0, -1);
      }
    }

    infoFile.elements.push(new InfoFileElement(name, value, currentComment));
  }

  return infoFile;
}
