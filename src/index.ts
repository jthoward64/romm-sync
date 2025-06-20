console.log("Starting RomM Sync...");

await import("./lib/init");

await import("./lib/sync/sync");

await import("./ui/webview");
