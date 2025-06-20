console.log("Starting RomM Sync...");

await import("./lib/init.ts");

await import("./lib/sync/sync.ts");

await import("./ui/webview.ts");
