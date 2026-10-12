export const DURATIONS = [5, 10, 20, 30];

export const OPPOSITE_DURATION = {
  5: 20,
  20: 5,
  10: 30,
  30: 10,
};

// The four numbered faces are arranged around the cube. Opposite pairs are
// fixed by the product configuration, not by individual components.
export const FACES = [
  { duration: 5, position: 'front' },
  { duration: 10, position: 'right' },
  { duration: 20, position: 'back' },
  { duration: 30, position: 'left' },
];

export const INITIAL_BOTTOM = 5;
export const INITIAL_TOP = OPPOSITE_DURATION[INITIAL_BOTTOM];
