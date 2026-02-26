import { useRef } from 'react';

interface ScrollOptions {
  cardHeight: number;
  gap: number;
}

export const useVerticalScroll = (options: ScrollOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollNext = () => {
    if (containerRef.current) {
      const { cardHeight, gap } = options;
      const container = containerRef.current;
      const scrollAmount = cardHeight + gap;

      const isAtBottom = 
        container.scrollTop + container.clientHeight >= container.scrollHeight - 20;

      if (isAtBottom) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return { containerRef, scrollNext };
};