type Navigate = (href: string) => void;

export function startViewTransitionNav(href: string, navigate: Navigate) {
  if (typeof document === 'undefined') {
    navigate(href);
    return;
  }

  const doc = document as Document & {
    startViewTransition?: (update: () => void) => void;
  };

  if (typeof doc.startViewTransition !== 'function') {
    navigate(href);
    return;
  }

  doc.startViewTransition(() => {
    navigate(href);
  });
}
