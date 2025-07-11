"use client";

import { Box, Button, Container, Paper } from "@mui/material";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    // <main className="flex h-full flex-col items-center justify-center">
    //   <h2 className="text-center">Something went wrong!</h2>
    //   <button
    //     className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
    //     onClick={
    //       // Attempt to recover by trying to re-render the invoices route
    //       () => reset()
    //     }
    //   >
    //     Try again
    //   </button>
    // </main>
    <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <h2>Something went wrong!</h2>
          <p> {error.message || "An unexpected error occurred."}</p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => reset()}
            sx={{ mt: 2 }}
          >
            Try again
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
