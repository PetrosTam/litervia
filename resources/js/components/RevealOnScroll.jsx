import { useEffect, useRef } from 'react';

/** Progressive enhancement: without JS, IntersectionObserver or motion permission,
 * the content is always visible. Only elements initially below the viewport hide.
 */
export default function RevealOnScroll({ children, className = '', direction }) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const bounds = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (bounds.top <= viewportHeight * 0.9) return;

    element.dataset.reveal = 'pending';
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.reveal = 'visible';
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px 3% 0px' },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      delete element.dataset.reveal;
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={`lv-scroll-reveal ${className}`}
      data-reveal-direction={direction}
    >
      {children}
    </div>
  );
}
