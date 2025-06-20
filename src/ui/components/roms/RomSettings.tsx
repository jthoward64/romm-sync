import {
  Accordion,
  AccordionSummary,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import ListItem from "@mui/material/ListItem";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useNotifications } from "@toolpad/core/useNotifications";
import { useState } from "react";
import { IpcClient } from "../../../ipc/Client.ts";
import type { Rom } from "../../../lib/Rom.ts";

export function RomSettings({
  rom,
  updateRom,
}: {
  rom: Rom;
  updateRom: (rom: Rom) => void;
}) {
  const { show } = useNotifications();
  const [loading, setLoading] = useState(false);

  return (
    <ListItem
      key={rom.rommRom.id}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box sx={{ width: "100%", padding: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography variant="body1">{rom.rommRom.name}</Typography>
          <Switch
            checked={rom.retroarchRom?.syncing ?? false}
            disabled={loading}
            onChange={async (event) => {
              async function go() {
                const newRom = await IpcClient.setSync({
                  id: rom.rommRom.id,
                  enabled: event.target.checked,
                });
                if (newRom.ok) {
                  console.log(
                    `Sync status updated for ROM: ${rom.rommRom.name}`,
                    JSON.stringify(newRom.rom),
                  );
                  rom.retroarchRom = newRom.rom;
                  updateRom(rom);
                } else {
                  show(
                    `Failed to update sync status: ${newRom.error.message}`,
                    {
                      severity: "error",
                      actionText: "Try Again",
                      onAction() {
                        void go();
                      },
                    },
                  );
                }
              }
              await go();
            }}
            color="primary"
          />
        </Box>
        {rom.retroarchRom?.syncing ? (
          <Accordion>
            <AccordionSummary>
              <Typography variant="body2">Syncing with RetroArch</Typography>
            </AccordionSummary>
            <FormControl fullWidth>
              <InputLabel>Selected File</InputLabel>
              <Select<string>
                value={rom.retroarchRom.rommFileId?.toString() ?? ""}
                disabled={loading}
                onChange={async (event) => {
                  setLoading(true);
                  const newRom = await IpcClient.selectFile({
                    romId: rom.rommRom.id,
                    fileId:
                      event.target.value === ""
                        ? null
                        : Number.parseInt(event.target.value),
                  }).finally(() => {
                    setLoading(false);
                  });

                  if (newRom.ok) {
                    rom.retroarchRom = newRom.rom;
                    updateRom(rom);
                  } else {
                    show(`Failed to select file: ${newRom.error.message}`, {
                      severity: "error",
                    });
                  }
                }}
                displayEmpty
                fullWidth
                sx={{ marginTop: 2 }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {rom.rommRom.files.map((file) => (
                  <MenuItem key={file.id.toString()} value={file.id.toString()}>
                    {file.fileName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Accordion>
        ) : null}
      </Box>
    </ListItem>
  );
}
