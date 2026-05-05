import { useCallback, useState } from 'react';

export interface UseImageNavigation {
  index: number;
  setIndex: (i: number) => void;
  next: () => void;
  prev: () => void;
}

export function useImageNavigation(
  total: number,
  initialIndex: number = 0,
): UseImageNavigation {
  const [index, setIndex] = useState(initialIndex);

  const next = useCallback(() => {
    setIndex((i) => (total === 0 ? 0 : (i + 1) % total));
  }, [total]);

  const prev = useCallback(() => {
    setIndex((i) => (total === 0 ? 0 : (i - 1 + total) % total));
  }, [total]);

  return { index, setIndex, next, prev };
}
