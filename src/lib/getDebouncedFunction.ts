export function getDebouncedFunction<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, delay);
  };

  return debouncedFn;
}
