import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { CircularProgress } from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { NotificationsProvider } from "@toolpad/core/useNotifications";
import { type SyntheticEvent, useCallback, useEffect, useState } from "react";
import { IpcClient } from "../../ipc/Client.js";
import type { IpcResult } from "../../ipc/Server.js";
import { Roms } from "./roms/Roms.jsx";
import { Settings } from "./roms/Settings.jsx";

export function Main() {
  const [value, setValue] = useState("roms");

  const handleChange = (_: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const [status, setStatus] = useState<IpcResult<"getStatus">["status"] | null>(
    null
  );
  const fetchStatus = useCallback(async () => {
    const result = await IpcClient.getStatus();
    if (result.ok) {
      setStatus(result.status);
    } else {
      console.error(`Error fetching status: ${result.error.message}`);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  return (
    <NotificationsProvider>
      <Box sx={{ width: "100%", typography: "body1" }}>
        {status === null ? (
          <CircularProgress sx={{ display: "block", margin: "auto" }} />
        ) : (
          <TabContext value={status.rommApiReady ? value : "settings"}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                <Tab
                  disabled={!status.rommApiReady}
                  label="Roms"
                  value="roms"
                />
                <Tab
                  disabled={!status.rommApiReady}
                  label="Saves"
                  value="saves"
                />
                <Tab
                  disabled={!status.rommApiReady}
                  label="States"
                  value="states"
                />
                <Tab
                  disabled={!status.rommApiReady}
                  label="Firmware"
                  value="firmware"
                />
                <Tab label="Settings" value="settings" />
              </TabList>
            </Box>
            <TabPanel value="roms">
              <Roms />
            </TabPanel>
            <TabPanel value="2">NYI</TabPanel>
            <TabPanel value="3">NYI</TabPanel>
            <TabPanel value="4">NYI</TabPanel>
            <TabPanel value="settings">
              <Settings onUpdated={() => fetchStatus()} />
            </TabPanel>
          </TabContext>
        )}
      </Box>
    </NotificationsProvider>
  );
}
