import { useState, useEffect } from 'react'

/** Delay a fast-changing value (search box) so we don't hit the API on every keystroke. */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
