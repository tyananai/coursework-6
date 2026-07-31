/* App shell — hash-based router, accent tweaks panel. */

// Force light theme (dark mode retired)
document.documentElement.dataset.theme = 'light';
try { localStorage.removeItem('resumekit::theme'); } catch (e) {}

function parseRoute(hash) {
  // hash like "#/resumes/abc/preview"
  const path = (hash || '#/').replace(/^#/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'list' };
  if (parts[0] === 'resumes') {
    if (parts[1] === 'new') return { name: 'new' };
    if (parts.length === 2) return { name: 'editor', id: parts[1] };
    if (parts.length === 3 && parts[2] === 'preview') return { name: 'preview', id: parts[1] };
  }
  return { name: 'list' };
}

function App() {
  const [hash, setHash] = React.useState(window.location.hash || '#/');

  React.useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = React.useCallback((path) => {
    window.location.hash = '#' + path;
    // scroll to top
    window.scrollTo({ top: 0 });
  }, []);

  const route = parseRoute(hash);

  let page;
  if (route.name === 'list') page = <ResumesListPage navigate={navigate} />;
  else if (route.name === 'new') page = <NewResumePage navigate={navigate} />;
  else if (route.name === 'editor') page = (
    <>
      <TopNav navigate={navigate} route="editor" regions={[]} industries={[]} filters={{}} setFilters={() => {}} onNewResume={() => navigate('/resumes/new')} />
      <ResumeEditorPage id={route.id} navigate={navigate} />
    </>
  );
  else if (route.name === 'preview') page = <PreviewPage id={route.id} navigate={navigate} />;

  return (
    <AuthProvider>
      <ToastProvider>
        {page}
      </ToastProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
