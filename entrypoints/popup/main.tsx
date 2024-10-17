import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import '@/styles/popup.scss';
import Home from './App';
import { About } from './About';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);

function App() {
    const [pageToShow, setPageToShow] = useState<Page>('main');

    return (
        <>
            {pageToShow === 'main' && <Home setPageToShow={setPageToShow} />}
            {pageToShow === 'about' && <About setPageToShow={setPageToShow} />}
        </>
    );
}

export type Page = 'main' | 'about';
