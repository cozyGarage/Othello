export const W = 'W';
export const B = 'B';
export const E = 'E';
export const P = 'P';

export const createBoard = (tiles) => ({
  playerTurn: B,
  tiles
});

export const tile = (board, [x, y]) =>
  board.tiles[y][x];

export const score = (board) => {
  let blackCount = 0;
  let whiteCount = 0;

  for (let x = 0; x < board.tiles.length; ++x) {
    for (let y = 0; y < board.tiles.length; ++y) {
      const tileVal = board.tiles[y][x];
      if(tileVal===B)
      {
        blackCount++;
      }
      else if (tileVal===W)
      {
        whiteCount++;
      }

    }
  }

  return {
    black: blackCount,
    white: whiteCount
  };
};

const isOutOfBounds = (board, [x, y]) =>
  x<0 || y<0 || x>=board.tiles.length || y>=board.tiles.length;

export const hasAdjacentPiece = (board, coord) => {
  const [xCoord, yCoord] = coord;
  for(let x = xCoord - 1; x <= (xCoord + 1); x++) {
    for(let y = yCoord - 1; y <= (yCoord + 1); y++) {
      // don't check the original coord, only adjacent coords
      if((x === xCoord) && (y === yCoord)) {
        continue;
      }
      if(isOutOfBounds(board, [x, y])){
        continue;
      }
      if(board.tiles[y][x]!==E){
          return true;
      }
    }
  }
  return false;
};

const DIRECTIONS = {
  'top': {
    xMod: 0,
    yMod: -1
  },
  'top-right': {
    xMod: 1,
    yMod: -1
  },
  'right': {
    xMod: 1,
    yMod: 0
  },
  'bottom-right': {
    xMod: 1,
    yMod: 1
  },
  'bottom': {
    xMod: 0,
    yMod: 1
  },
  'bottom-left': {
    xMod: -1,
    yMod: 1
  },
  'left': {
    xMod: -1,
    yMod: 0
  },
  'top-left': {
    xMod: -1,
    yMod: -1
  }
};

const findFlippableDirections = (board, [xCoord, yCoord]) => {
  const startColor = board.tiles[yCoord][xCoord];
  const alternateColor = (startColor === W) ? B : W;
  const flippableDirections = [];

  for (const dirName in DIRECTIONS) {
    const dirModifier = DIRECTIONS[dirName];
    let x = xCoord + dirModifier.xMod;
    let y = yCoord + dirModifier.yMod;

    if (!isOutOfBounds(board, [x, y]) && (board.tiles[y][x] === alternateColor)) {
      let isAlternateColor = true;

      do {
        x += dirModifier.xMod;
        y += dirModifier.yMod;

        if (isOutOfBounds(board, [x, y])) {
          isAlternateColor = false;
        }
        else {
          const nextTile = board.tiles[y][x];
          if (nextTile === E) {
            isAlternateColor = false;
          }
          else if (nextTile === startColor) {
            flippableDirections.push(dirName);
            isAlternateColor = false;
          }
        }
      } while (isAlternateColor);
    }
  }

  return flippableDirections;
}

const flipTiles = (board, directions, [xCoord, yCoord]) => {
  const flipColor = board.tiles[yCoord][xCoord];
  for (const dirName of directions) {
    const dirModifier = DIRECTIONS[dirName];
    let x = xCoord + dirModifier.xMod;
    let y = yCoord + dirModifier.yMod;

    while (board.tiles[y][x] !== flipColor) {
      board.tiles[y][x] = flipColor;
      x+= dirModifier.xMod;
      y+= dirModifier.yMod;
    }
  }
}

const alternatePlayer = (player) =>
  (player === B) ? W : B;

export const takeTurn = (board, coord) => {
  const [x, y] = coord;
  if(board.tiles[y][x] !== E) {
    throw new Error('Error: You cannot place a piece on an occupied square.');
  }

  // First place the piece temporarily to check for flippable directions
  board.tiles[y][x] = board.playerTurn;
  const flippableDirections = findFlippableDirections(board, coord);
  
  // A move is only valid if it flips at least one opponent piece
  if(flippableDirections.length === 0) {
    board.tiles[y][x] = E; // Revert the placement
    throw new Error('Error: This move does not flip any opponent pieces.');
  }
  
  flipTiles(board, flippableDirections, coord);
  board.playerTurn = alternatePlayer(board.playerTurn);
};

// Check if a move is valid for the current player
export const isValidMove = (board, coord) => {
  const [x, y] = coord;
  if(board.tiles[y][x] !== E) {
    return false;
  }
  
  // Temporarily place the piece and check for flippable directions
  board.tiles[y][x] = board.playerTurn;
  const flippableDirections = findFlippableDirections(board, coord);
  board.tiles[y][x] = E; // Revert
  
  return flippableDirections.length > 0;
};

// Get all valid moves for the current player
export const getValidMoves = (board) => {
  const validMoves = [];
  for (let y = 0; y < board.tiles.length; y++) {
    for (let x = 0; x < board.tiles[y].length; x++) {
      if (isValidMove(board, [x, y])) {
        validMoves.push([x, y]);
      }
    }
  }
  return validMoves;
};

// Check if the game is over
export const isGameOver = (board) => {
  // Check if board is full
  const isBoardFull = board.tiles.every(row => row.every(tile => tile !== E));
  if (isBoardFull) {
    return true;
  }
  
  // Check if current player has valid moves
  const currentPlayerHasMoves = getValidMoves(board).length > 0;
  if (currentPlayerHasMoves) {
    return false;
  }
  
  // Check if other player has valid moves
  const originalPlayer = board.playerTurn;
  board.playerTurn = alternatePlayer(board.playerTurn);
  const otherPlayerHasMoves = getValidMoves(board).length > 0;
  board.playerTurn = originalPlayer; // Restore
  
  return !otherPlayerHasMoves;
};

// Get the winner (or null if tie)
export const getWinner = (board) => {
  const scores = score(board);
  if (scores.black > scores.white) {
    return B;
  } else if (scores.white > scores.black) {
    return W;
  }
  return null; // Tie
};

const annotateSquare = (square, board, coord) =>
  (square !== E) ? square : isValidMove(board, coord) ? P : E;

export const getAnnotatedBoard = (board) => ({
  ...board,
  tiles: board.tiles.map((row, y) => row.map((square, x) => annotateSquare(square, board, [x, y])))
});