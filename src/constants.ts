export const minesweeper_layouts = {
  'beginner': {
    width: 9,
    height: 9,
    numMines: 10,
    squareSize: 80
  },
  'intermediate': {
    width: 16,
    height: 16,
    numMines: 40,
    squareSize: 60
  },
  'advanced': {
    width: 30,
    height: 16,
    numMines: 99,
    squareSize: 60
  },
};

export const aiMoveTimeMs = 750;
export const aiBufferTimeMs = 250;

// export const layout = minesweeper_layouts.beginner;
// export const layout = minesweeper_layouts.intermediate;
export const layout = minesweeper_layouts.advanced;
