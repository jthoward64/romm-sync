import { createRoot } from 'react-dom/client';
import { Main } from "./components/Main";

console.log("Initializing main UI...");

const root = createRoot(document.getElementById('app')!);
root.render(<Main />);

