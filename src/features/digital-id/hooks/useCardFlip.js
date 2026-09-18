import { useCallback, useState } from 'react';

/**
 * Flip state for the card. Deliberately has nothing to do with the
 * tilt hook — the two transforms are composed on separate DOM layers
 * in DigitalIdCard so a flip animation never overwrites tilt state.
 * The card is triggered via a native <button>, which already handles
 * Enter/Space, so this hook only needs to hold the boolean.
 */
export function useCardFlip(initialFlipped = false) {
  const [flipped, setFlipped] = useState(initialFlipped);

  const toggleFlip = useCallback(() => setFlipped((prev) => !prev), []);

  return { flipped, toggleFlip };
}
