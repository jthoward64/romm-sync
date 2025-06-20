import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { useState, type SyntheticEvent } from "react";
import { Roms } from "./roms/Roms";

import { NotificationsProvider } from "@toolpad/core/useNotifications";

export function Main() {
  const [value, setValue] = useState("1");

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <NotificationsProvider>
      <Box sx={{ width: "100%", typography: "body1" }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Roms" value="1" />
              <Tab label="Saves" value="2" />
              <Tab label="States" value="3" />
              <Tab label="Firmware" value="3" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <Roms />
          </TabPanel>
          <TabPanel value="2">NYI</TabPanel>
          <TabPanel value="3">NYI</TabPanel>
          <TabPanel value="4">NYI</TabPanel>
        </TabContext>
      </Box>
    </NotificationsProvider>
  );
}
