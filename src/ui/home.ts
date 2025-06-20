import { DbRetroArchRom } from "../lib/database/RetroArchRom";
import { html } from "./html";

export async function homePage() {
  const roms = await DbRetroArchRom.all();

  // Tailwind is available
  const body = `
<ul class="list-disc pl-6">
  ${roms
    .map((rom) => {
      return `<li>${rom.id} - ${rom.retroarchPath}</li>`;
    })
    .join("")}
</ul>
`;

  return {
    source: html({
      body,
      title: "RetroArch Roms",
    }),
  };
}
