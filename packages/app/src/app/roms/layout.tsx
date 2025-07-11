import { Alert, Container } from "@mui/material";
import { loadFromRomm } from "../../lib/init";
import { safeAction } from "../../lib/actions/safeAction";

export default async function RomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loadFromRommResponse = await safeAction(loadFromRomm)();

  return (
    <Container component="main">
      {children}
      {!loadFromRommResponse.ok && (
        <Alert
          severity="error"
          sx={{ mt: 2, position: "fixed", bottom: 0, left: 0, right: 0 }}
        >
          {loadFromRommResponse.error.message}
        </Alert>
      )}
    </Container>
  );
}
