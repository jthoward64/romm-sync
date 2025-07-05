import { Box, Button, TextField, Typography } from "@mui/material";
import { useNotifications } from "@toolpad/core/useNotifications";
import { useEffect, useState } from "react";
import { IpcClient } from "../../../ipc/Client.ts";

const SECRET_PASSWORD = "********";

export function Settings({ onUpdated }: { onUpdated?: () => void }) {
  const [initialSettings, setInitialSettings] = useState<
    | {
        username: string;
        passwordSet: boolean;
        origin: string;
      }
    | null
    | undefined
  >(undefined);
  const { show } = useNotifications();

  useEffect(() => {
    async function fetchSettings() {
      const settings = await IpcClient.getSettings();
      if (settings.ok) {
        setInitialSettings(settings.settings);
      } else {
        show(`Error fetching settings: ${settings.error.message}`, {
          severity: "error",
        });
      }
    }

    void fetchSettings();
  }, [show]);

  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        try {
          setLoading(true);
          const formData = new FormData(e.target as HTMLFormElement);
          const username = formData.get("username") as string;
          const password = formData.get("password") as string;
          const origin = formData.get("origin") as string;
          IpcClient.setSettings({
            username,
            password:
              password === SECRET_PASSWORD || password === "" ? null : password,
            origin,
          })
            .then((result) => {
              if (result.ok) {
                show("Settings saved successfully!", { severity: "success" });
                onUpdated?.();
              } else {
                show(`Error saving settings: ${result.error.message}`, {
                  severity: "error",
                });
              }
            })
            .catch((error) => {
              show(
                `Error saving settings: ${error instanceof Error ? error.message : "Unknown error"}`,
                {
                  severity: "error",
                },
              );
            })
            .finally(() => {
              setLoading(false);
            });
        } catch (error) {
          show(
            `Error saving settings: ${error instanceof Error ? error.message : "Unknown error"}`,
            {
              severity: "error",
            },
          );
          setLoading(false);
        }
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        RomM Settings
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          name="username"
          label="RomM Username"
          required
          defaultValue={initialSettings?.username}
          slotProps={{
            input: {
              startAdornment: " ",
            },
          }}
          fullWidth
        />
        <TextField
          name="password"
          type="password"
          label="RomM Password"
          defaultValue={
            initialSettings?.passwordSet ? SECRET_PASSWORD : undefined
          }
          slotProps={{
            input: {
              startAdornment: " ",
            },
          }}
          fullWidth
        />
        <TextField
          name="origin"
          type="url"
          label="RomM Origin"
          required
          defaultValue={initialSettings?.origin}
          slotProps={{
            input: {
              startAdornment: " ",
            },
          }}
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          loading={loading}
          disabled={loading}
        >
          Save Settings
        </Button>
      </Box>
    </form>
  );
}
