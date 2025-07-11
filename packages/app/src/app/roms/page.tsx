import { revalidatePath } from "next/cache";
import { getAllRoms } from "../../lib/interface";
import RomsList from "../../ui/components/RomList";
import { RommApiClient } from "../../lib/romm/RomM";

export default async function Roms() {
  const apiClient = await RommApiClient.getInstance();

  if (!apiClient) {
    throw new Error("RommApiClient is not initialized.");
  }

  const roms = await getAllRoms({
    apiClient,
  });

  return (
    <RomsList
      roms={roms}
      onChange={async () => {
        "use server";
        revalidatePath("/roms");
      }}
    />
  );
}
