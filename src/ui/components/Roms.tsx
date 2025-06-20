import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { IpcClient } from "../../ipc/Client";
import type { RetroArchRom } from "../../lib/retroarch/RetroArch";

export function Roms() {
  const [roms, setRoms] = useState<RetroArchRom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoms() {
      try {
        const fetchedRoms = await IpcClient.getDbRoms();
        setRoms(fetchedRoms);
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
        <ListItem key={rom.retroarch.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1">{rom.romm.name}</Typography>
          <Switch
            checked={rom.retroarch.syncing}
            onChange={async (event) => {
              await IpcClient.setSync({ id: rom.retroarch.id, enabled: event.target.checked });
              rom.retroarch.syncing = event.target.checked;
              setRoms([...roms]); // Trigger re-render
            }}
            color="primary"
          />
        </ListItem>
      ))}
    </List>
  )
}