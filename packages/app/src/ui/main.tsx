import { createRoot } from "react-dom/client";
import { Main } from "./components/Main.jsx";

console.log("Initializing main UI...");

// biome-ignore lint/style/noNonNullAssertion: This is a known element in the HTML.
const root = createRoot(document.getElementById("app")!);
root.render(<Main />);
