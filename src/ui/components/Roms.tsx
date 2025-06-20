import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { IpcClient } from "../../ipc/Client";
import type { Rom } from "../../lib/Rom";

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
        setError(`Failed to load ROMs: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchRoms();
  }, []);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto' }} />;
  }

  if (error) {
    return <Typography variant="body1" color="error" sx={{ textAlign: 'center' }}>
      {error}
    </Typography>;
  }
  
  if (roms.length === 0) {
    return <Typography variant="body1" sx={{ textAlign: 'center' }}>
      No ROMs found.
    </Typography>;
  }

  return (
    <List >
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Available ROMs
      </Typography>
      {roms.map((rom) => (
        <ListItem key={rom.rommRom.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1">{rom.rommRom.name}</Typography>
          <Switch
            checked={rom.retroarchRom?.syncing ?? false}
            onChange={async (event) => {
              const newRom = await IpcClient.setSync({ id: rom.rommRom.id, enabled: event.target.checked });
              if (newRom.ok) {
                console.log(`Sync status updated for ROM: ${rom.rommRom.name}`, JSON.stringify(newRom.rom));
                rom.retroarchRom = newRom.rom;
                setRoms((prevRoms) => [...prevRoms]);
              } else {
                setError(`Failed to update sync status: ${newRom.error.message}`);
              }
            }}
            color="primary"
          />
        </ListItem>
      ))}
    </List>
  )
}