import { validShoppingPage } from './marketplace';

declare global {
  interface Window {
    kalaNavigate?: (url: string, options?: { replace?: boolean }) => Promise<boolean>;
  }
}

let active = false;
let installed = false;
let enhancedHistory = false;
let request: AbortController | null = null;

async function navigate(input: string, { replace = false, history = true } = {}) {
  const url = new URL(input, window.location.origin);
  if (url.origin !== window.location.origin || !validShoppingPage(url.pathname)) return false;
  request?.abort();
  const controller = new AbortController();
  request = controller;
  document.documentElement.classList.add('archava-page-loading');
  try {
    const response = await fetch(url.href, { signal: controller.signal, headers: { Accept: 'text/html' } });
    if (!response.ok) throw new Error('Halaman belum tersedia.');
    const documentNext = new DOMParser().parseFromString(await response.text(), 'text/html');
    const main = documentNext.getElementById('mainContent');
    const current = document.getElementById('mainContent');
    if (!main || !current || controller.signal.aborted) return false;
    // The server owns the page HTML. The voice widget stays mounted outside main.
    current.innerHTML = main.innerHTML;
    document.title = documentNext.title;
    document.body.dataset.page = documentNext.body.dataset.page;
    document.body.dataset.productId = documentNext.body.dataset.productId;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', documentNext.querySelector('meta[name="description"]')?.getAttribute('content') || '');
    const search = document.getElementById('searchInput') as HTMLInputElement | null;
    if (search) search.value = (documentNext.getElementById('searchInput') as HTMLInputElement | null)?.value || '';
    if (history) {
      const state = { archavaPage: true };
      if (replace) window.history.replaceState(state, '', url.href);
      else window.history.pushState(state, '', url.href);
      enhancedHistory = true;
    }
    window.dispatchEvent(new CustomEvent('kala:pagechange'));
    window.scrollTo({ top: 0, behavior: 'instant' });
    current.tabIndex = -1;
    current.focus({ preventScroll: true });
    return true;
  } catch (error) {
    if (!controller.signal.aborted) window.dispatchEvent(new CustomEvent('archava:navigation-error', { detail: { message: error instanceof Error ? error.message : 'Halaman gagal dibuka.' } }));
    return false;
  } finally {
    if (request === controller) document.documentElement.classList.remove('archava-page-loading');
  }
}

export function preserveCallNavigation(enabled: boolean) {
  active = enabled;
  if (active) window.kalaNavigate = navigate;
  else delete window.kalaNavigate;
  if (installed) return;
  installed = true;
  document.addEventListener('click', (event) => {
    if (!active || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element)?.closest<HTMLAnchorElement>('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download') || link.getAttribute('href')?.startsWith('#')) return;
    const url = new URL(link.href);
    if (url.origin !== window.location.origin || !validShoppingPage(url.pathname)) return;
    event.preventDefault();
    void navigate(url.href);
  });
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;
    if (!active || event.defaultPrevented || !['searchForm'].includes(form.id) && !form.matches('.price-filter, .sort-form')) return;
    const url = new URL(form.action);
    if (url.origin !== window.location.origin || !validShoppingPage(url.pathname)) return;
    event.preventDefault();
    url.search = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
    void navigate(url.href);
  });
  window.addEventListener('popstate', () => {
    if (active || enhancedHistory) void navigate(window.location.href, { history: false });
  });
}
