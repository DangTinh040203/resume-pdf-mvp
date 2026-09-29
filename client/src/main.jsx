import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import './index.css';

// No StrictMode: Paged.js does imperative DOM surgery (measuring/moving
// nodes) that isn't safe under React's dev-mode double-invoked effects —
// two concurrent preview() runs race on the same DOM and throw.
createRoot(document.getElementById('root')).render(<App />);
