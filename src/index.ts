import { Webview } from "webview-bun";
import { homePage } from "./ui/home";

await import("./lib/init");

const webview = new Webview();

webview.setHTML(await homePage());
webview.run();
