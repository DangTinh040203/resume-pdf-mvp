import { useState } from 'react';

import PagedPreview from './components/PagedPreview';
import ResumeContent from './components/ResumeContent';
import { sampleResume } from './data/sampleResume';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// /print: bare content only, no app chrome — this is the exact route the
// backend's headless Chromium loads and calls page.pdf() against. No
// Paged.js here; Chromium's own print engine paginates it natively using
// the same @page CSS rule (see index.css).
function PrintPage() {
  return (
    <div className='bg-white'>
      <ResumeContent resume={sampleResume} />
    </div>
  );
}

function DownloadButton() {
  const [state, setState] = useState('idle');

  async function handleDownload() {
    setState('loading');
    try {
      const res = await fetch(`${API_URL}/api/resume.pdf`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setState('idle');
    } catch (error) {
      console.error('[DownloadButton] failed:', error);
      setState('error');
    }
  }

  return (
    <div className='mb-6 flex flex-col items-center gap-2'>
      <button
        onClick={handleDownload}
        disabled={state === 'loading'}
        className='bg-primary rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-60'
      >
        {state === 'loading' ? 'Generating PDF…' : 'Download PDF'}
      </button>
      {state === 'error' && (
        <p className='text-sm text-red-600'>
          Failed to generate PDF — is the backend running on {API_URL}?
        </p>
      )}
    </div>
  );
}

// /: the live preview, paginated on screen via Paged.js, plus the button
// that hits the Express backend for the actual export.
function PreviewPage() {
  return (
    <div className='min-h-screen bg-neutral-100 py-10'>
      <div className='mx-auto mb-8 max-w-2xl px-4 text-center'>
        <h1 className='text-2xl font-bold text-neutral-900'>Resume PDF MVP</h1>
        <p className='mt-1 text-sm text-neutral-500'>
          React + Tailwind template, paginated live with Paged.js. "Download PDF" hits the
          Express backend, which renders the same template through headless Chromium.
        </p>
      </div>
      <DownloadButton />
      <PagedPreview resume={sampleResume} />
    </div>
  );
}

function App() {
  const isPrintRoute = window.location.pathname === '/print';
  return isPrintRoute ? <PrintPage /> : <PreviewPage />;
}

export default App;
