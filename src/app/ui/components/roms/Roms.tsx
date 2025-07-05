import { Container, TextField } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { type JSX, useEffect, useMemo, useState } from "react";
import { IpcClient } from "../../../ipc/Client.ts";
import type { Rom } from "../../../lib/Rom.ts";
import { RomSettings } from "./RomSettings.tsx";

export function Roms() {
  const [roms, setRoms] = useState<Rom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterText, setFilterText] = useState<string>();

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
      roms
        .map((rom) => {
          let searchSimilarity = 0;
          if (!filterText) {
            searchSimilarity += 10;
          } else {
            const search = filterText.toLowerCase();

            const highPriorityMatchers = [rom.rommRom.name?.toLowerCase()];
            const lowPriorityMatchers = [
              rom.rommRom.platformName?.toLowerCase(),
              rom.rommRom.platformCustomName?.toLowerCase(),
              ...(rom.rommRom.metadatum.collections?.map((name) =>
                name.toLowerCase(),
              ) ?? []),
            ];

            if (highPriorityMatchers.some((name) => name?.includes(search))) {
              searchSimilarity += 4;
            }
            if (lowPriorityMatchers.some((name) => name?.includes(search))) {
              searchSimilarity += 2;
            }
          }
          return {
            ...rom,
            searchSimilarity,
          };
        })
        .filter((rom) => rom.searchSimilarity > 0)
        .toSorted(
          // syncing, search, alphabetical
          (a, b) => {
            const aSyncing = a.retroarchRom?.syncing ? 10 : 0;
            const bSyncing = b.retroarchRom?.syncing ? 10 : 0;
            if (aSyncing !== bSyncing) {
              // Syncing first
              return bSyncing - aSyncing;
            }
            if (a.searchSimilarity !== b.searchSimilarity) {
              // Higher search similarity first
              return b.searchSimilarity - a.searchSimilarity;
            }
            const platformSort = a.rommRom.platformDisplayName
              ?.toLowerCase()
              .localeCompare(
                b.rommRom.platformDisplayName?.toLowerCase() ?? "",
              );
            if (platformSort !== 0) {
              // Platform name sort
              return platformSort;
            }
            // Finally, sort by ROM name
            return (
              a.rommRom.name
                ?.toLowerCase()
                .localeCompare(b.rommRom.name?.toLowerCase() ?? "") || 0
            );
          },
        ),
    [roms, filterText],
  );

  let component: JSX.Element | JSX.Element[] | null = null;

  if (loading) {
    component = <CircularProgress sx={{ display: "block", margin: "auto" }} />;
  } else if (error) {
    component = (
      <Typography variant="body1" color="error" sx={{ textAlign: "center" }}>
        {error}
      </Typography>
    );
  } else if (sortedRoms.length === 0) {
    component = (
      <Typography variant="body1" sx={{ textAlign: "center" }}>
        No ROMs found.
      </Typography>
    );
  } else {
    component = sortedRoms.map((rom) => (
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
    ));
  }

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        marginTop: 2,
        padding: 0,
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Available ROMs
      </Typography>
      <TextField
        type="search"
        placeholder="Search ROMs..."
        variant="outlined"
        size="small"
        sx={{ width: "80ch" }}
        value={filterText ?? ""}
        onChange={(e) => setFilterText(e.target.value)}
      />
      <List>{component}</List>
    </Container>
  );
}
