import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  targetRef?: React.RefObject<HTMLElement | null>;
  threshold?: number;
  className?: string;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  targetRef,
  threshold = 280,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      let currentScrollTop = 0;
      if (targetRef && targetRef.current) {
        currentScrollTop = targetRef.current.scrollTop;
      } else {
        currentScrollTop = window.scrollY || document.documentElement.scrollTop;
      }
      setIsVisible(currentScrollTop > threshold);
    };

    // Initial check
    handleScroll();

    if (targetRef && targetRef.current) {
      const el = targetRef.current;
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [targetRef, threshold]);

  const handleScrollToTop = () => {
    if (targetRef && targetRef.current) {
      targetRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label="Scroll to top of page"
      title="Scroll to top"
      className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 p-2.5 sm:p-3 rounded-full bg-[#E50914] hover:bg-[#c40812] text-white shadow-lg shadow-[#E50914]/30 dark:shadow-black/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FFC928] focus:ring-offset-2 dark:focus:ring-offset-[#101010] cursor-pointer flex items-center justify-center ${
        isVisible
          ? 'opacity-100 scale-100 pointer-events-auto translate-y-0'
          : 'opacity-0 scale-75 pointer-events-none translate-y-4'
      } ${className}`}
    >
      <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
    </button>
  );
};
