import { createRoot } from 'react-dom/client';
import { Main } from "./components/Main";

document.body.innerHTML = '<div id="app"></div>';

const root = createRoot(document.getElementById('app')!);
root.render(<Main />);

