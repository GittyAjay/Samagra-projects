function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapLine(text: string, maxChars = 82) {
  if (text.length <= maxChars) {
    return [text];
  }

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function buildPageContent(lines: string[]) {
  const commands: string[] = ["BT", "/F1 11 Tf", "50 790 Td", "14 TL"];

  lines.forEach((line, index) => {
    const safe = escapePdfText(line);
    if (index === 0) {
      commands.push(`(${safe}) Tj`);
    } else {
      commands.push(`T* (${safe}) Tj`);
    }
  });

  commands.push("ET");
  return commands.join("\n");
}

export function createSimplePdf(input: {
  title: string;
  subtitle?: string;
  sections: Array<{
    heading: string;
    rows: string[];
  }>;
}) {
  const flatLines: string[] = [input.title, input.subtitle ?? "", ""].filter(Boolean);

  input.sections.forEach((section) => {
    flatLines.push(section.heading);
    section.rows.forEach((row) => {
      wrapLine(row).forEach((wrapped) => flatLines.push(wrapped));
    });
    flatLines.push("");
  });

  const pages: string[][] = [];
  let current: string[] = [];

  flatLines.forEach((line) => {
    current.push(line);
    if (current.length >= 48) {
      pages.push(current);
      current = [];
    }
  });

  if (current.length) {
    pages.push(current);
  }

  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Kids [] /Count 0 >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  pages.forEach((pageLines) => {
    const content = buildPageContent(pageLines);
    const contentId = objects.length + 1;
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    contentObjectIds.push(contentId);

    const pageId = objects.length + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageObjectIds.push(pageId);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "binary");
}
