import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { IpcClient } from "../../../ipc/Client.ts";
import type { Rom } from "../../../lib/Rom.ts";
import { RomSettings } from "./RomSettings.tsx";

export function Roms() {
  const [roms, setRoms] = useState<Rom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoms() {
      try {
        const fetchedRoms = await IpcClient.getDbRoms();
        if (fetchedRoms.ok) {
          setRoms(fetchedRoms.roms);
        } else {
          setError(`Error fetching ROMs: ${fetchedRoms.error.message}`);
        }
      } catch (err) {
        setError(
          `Failed to load ROMs: ${
            err instanceof Error ? err.message : "Unknown error"
          }`,
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchRoms();
  }, []);

  const sortedRoms = useMemo(
    () =>
      roms.toSorted(
        // syncing first, then alphabetically by name
        (a, b) =>
          (b.retroarchRom?.syncing ? 1 : 0) -
            (a.retroarchRom?.syncing ? 1 : 0) ||
          (a.rommRom.name ?? "").localeCompare(b.rommRom.name ?? ""),
      ),
    [roms],
  );

  if (loading) {
    return <CircularProgress sx={{ display: "block", margin: "auto" }} />;
  }

  if (error) {
    return (
      <Typography variant="body1" color="error" sx={{ textAlign: "center" }}>
        {error}
      </Typography>
    );
  }

  if (sortedRoms.length === 0) {
    return (
      <Typography variant="body1" sx={{ textAlign: "center" }}>
        No ROMs found.
      </Typography>
    );
  }

  return (
    <List>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Available ROMs
      </Typography>
      {sortedRoms.map((rom) => (
        <RomSettings
          key={rom.rommRom.id}
          rom={rom}
          updateRom={(newRom) =>
            setRoms((roms) => [
              ...roms.filter((r) => r.rommRom.id !== rom.rommRom.id),
              newRom,
            ])
          }
        />
      ))}
    </List>
  );
}
