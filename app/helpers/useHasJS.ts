import { useState, useEffect } from 'react'

export function useHasJS() {
  const [hasJS, setHasJS] = useState(false)

  useEffect(() => {
    if (!hasJS) {
      setHasJS(true)
    }
  }, [hasJS])

  return hasJS
}
