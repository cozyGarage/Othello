import { getValidMoves, takeTurn, E } from './index';
import { lookupOpeningBook } from './openingBook';
import { CORNER_COORDINATES } from './positionWeights';
import { countEmptySquares, evaluateBoardForPlayer, exactTerminalScore, EXACT_ENDGAME_EMPTIES, staticMoveOrderScore, } from './evaluateBoard';
const CORNERS = CORNER_COORDINATES.map(([x, y]) => [x, y]);
const MAX_TT_SIZE = 100000;
/**
 * OthelloBot — AI opponent with easy / medium / hard strategies.
 */
export class OthelloBot {
    constructor(difficulty = 'medium', player = 'W') {
        this.nodesSearched = 0;
        this.useOpeningBook = true;
        this.moveHistory = [];
        this.searchDepth = 5;
        this.searchDeadline = null;
        this.searchAborted = false;
        this.difficulty = difficulty;
        this.player = player;
        this.transpositionTable = new Map();
    }
    getDifficulty() {
        return this.difficulty;
    }
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
    getPlayer() {
        return this.player;
    }
    setPlayer(player) {
        this.player = player;
    }
    getNodesSearched() {
        return this.nodesSearched;
    }
    setSearchDepth(depth) {
        this.searchDepth = Math.max(1, Math.min(12, depth));
    }
    getSearchDepth() {
        return this.searchDepth;
    }
    clearTranspositionTable() {
        this.transpositionTable.clear();
    }
    getTranspositionTableSize() {
        return this.transpositionTable.size;
    }
    setUseOpeningBook(use) {
        this.useOpeningBook = use;
    }
    isOpeningBookEnabled() {
        return this.useOpeningBook;
    }
    /**
     * Calculates the best move for the current board state.
     *
     * @param board - Current game board
     * @param moveHistory - Optional history for opening-book lookup
     * @param options - Optional time limit / progress for hard ID search
     */
    calculateMove(board, moveHistory, options) {
        this.nodesSearched = 0;
        this.searchAborted = false;
        this.searchDeadline = null;
        const validMoves = getValidMoves(board);
        if (validMoves.length === 0) {
            return null;
        }
        if (moveHistory) {
            this.moveHistory = moveHistory;
        }
        if (this.useOpeningBook && this.difficulty === 'hard' && this.moveHistory.length < 12) {
            const bookMove = lookupOpeningBook(this.moveHistory);
            if (bookMove) {
                const isValid = validMoves.some((m) => m[0] === bookMove[0] && m[1] === bookMove[1]);
                if (isValid) {
                    return bookMove;
                }
            }
        }
        switch (this.difficulty) {
            case 'easy':
                return this.getRandomMove(validMoves);
            case 'medium':
                return this.getWeightedOnePlyMove(board, validMoves);
            case 'hard':
                return this.getHardMove(board, validMoves, options);
            default:
                return this.getRandomMove(validMoves);
        }
    }
    getRandomMove(validMoves) {
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        const move = validMoves[randomIndex];
        if (!move) {
            throw new Error('No valid moves available');
        }
        return move;
    }
    /**
     * Medium: pick the move with the best 1-ply weighted evaluation (not raw flips).
     */
    getWeightedOnePlyMove(board, validMoves) {
        const firstMove = validMoves[0];
        if (!firstMove) {
            throw new Error('No valid moves available');
        }
        let bestMove = firstMove;
        let bestScore = -Infinity;
        for (const move of validMoves) {
            const clonedBoard = this.cloneBoard(board);
            this.simulateMove(clonedBoard, move);
            const moveScore = evaluateBoardForPlayer(clonedBoard, this.player);
            if (moveScore > bestScore) {
                bestScore = moveScore;
                bestMove = move;
            }
        }
        return bestMove;
    }
    getHardMove(board, validMoves, options) {
        if (validMoves.length === 1) {
            return validMoves[0];
        }
        const timeLimit = options?.timeLimitMs;
        if (timeLimit && timeLimit > 0) {
            return this.iterativeDeepeningSearch(board, validMoves, timeLimit, options?.onDepthComplete);
        }
        return this.searchRoot(board, validMoves, this.searchDepth);
    }
    iterativeDeepeningSearch(board, validMoves, timeLimitMs, onDepthComplete) {
        const start = Date.now();
        this.searchDeadline = start + timeLimitMs;
        const empties = countEmptySquares(board);
        const maxDepth = empties <= EXACT_ENDGAME_EMPTIES ? Math.min(12, empties + 2) : 10;
        let bestMove = this.orderMoves(validMoves, board)[0] ?? validMoves[0];
        let completedDepth = 0;
        for (let depth = 1; depth <= maxDepth; depth++) {
            if (Date.now() - start >= timeLimitMs * 0.95)
                break;
            this.searchAborted = false;
            const move = this.searchRoot(board, validMoves, depth);
            if (!this.searchAborted || completedDepth === 0) {
                bestMove = move;
                completedDepth = depth;
                onDepthComplete?.({
                    depth,
                    bestMove,
                    nodesSearched: this.nodesSearched,
                });
            }
            // If we nearly used the budget, stop before exploding the next ply
            if (Date.now() - start > timeLimitMs * 0.7 && depth >= 4)
                break;
        }
        this.searchDeadline = null;
        this.searchAborted = false;
        return bestMove;
    }
    searchRoot(board, validMoves, depth) {
        const orderedMoves = this.orderMoves(validMoves, board);
        const firstMove = orderedMoves[0] ?? validMoves[0];
        if (!firstMove) {
            throw new Error('No valid moves available');
        }
        let bestMove = firstMove;
        let bestScore = -Infinity;
        let alpha = -Infinity;
        const beta = Infinity;
        for (const move of orderedMoves) {
            if (this.shouldAbort())
                break;
            const clonedBoard = this.cloneBoard(board);
            this.simulateMove(clonedBoard, move);
            const moveScore = this.minimaxWithTT(clonedBoard, depth - 1, alpha, beta, false);
            if (moveScore > bestScore) {
                bestScore = moveScore;
                bestMove = move;
            }
            alpha = Math.max(alpha, bestScore);
        }
        return bestMove;
    }
    shouldAbort() {
        if (this.searchDeadline !== null && Date.now() >= this.searchDeadline) {
            this.searchAborted = true;
            return true;
        }
        return false;
    }
    orderMoves(moves, board) {
        const hash = this.getBoardHash(board);
        const ttBest = this.transpositionTable.get(hash)?.bestMove;
        const scored = moves.map((move) => ({
            move,
            score: (ttBest && move[0] === ttBest[0] && move[1] === ttBest[1] ? 10000 : 0) +
                staticMoveOrderScore(move, board, this.player) +
                this.getMoveOrderScore(move, board),
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored.map((s) => s.move);
    }
    getMoveOrderScore(move, board) {
        // Extra corner / X / C nuance beyond staticMoveOrderScore
        if (this.isCorner(move))
            return 50;
        if (this.isXSquare(move)) {
            const adjacentCorner = this.getAdjacentCorner(move);
            if (adjacentCorner) {
                const [cx, cy] = adjacentCorner;
                if (board.tiles[cy]?.[cx] === this.player)
                    return 20;
            }
            return -20;
        }
        if (this.isCSquare(move)) {
            const adjacentCorner = this.getAdjacentCornerForC(move);
            if (adjacentCorner) {
                const [cx, cy] = adjacentCorner;
                if (board.tiles[cy]?.[cx] === this.player)
                    return 10;
            }
            return -10;
        }
        return 0;
    }
    isCorner(move) {
        return CORNERS.some(([cx, cy]) => move[0] === cx && move[1] === cy);
    }
    isXSquare(move) {
        return ((move[0] === 1 && move[1] === 1) ||
            (move[0] === 1 && move[1] === 6) ||
            (move[0] === 6 && move[1] === 1) ||
            (move[0] === 6 && move[1] === 6));
    }
    isCSquare(move) {
        const [x, y] = move;
        return ((x === 0 && y === 1) ||
            (x === 1 && y === 0) ||
            (x === 0 && y === 6) ||
            (x === 1 && y === 7) ||
            (x === 6 && y === 0) ||
            (x === 7 && y === 1) ||
            (x === 6 && y === 7) ||
            (x === 7 && y === 6));
    }
    getAdjacentCorner(xSquare) {
        const [x, y] = xSquare;
        if (x === 1 && y === 1)
            return [0, 0];
        if (x === 1 && y === 6)
            return [0, 7];
        if (x === 6 && y === 1)
            return [7, 0];
        if (x === 6 && y === 6)
            return [7, 7];
        return null;
    }
    getAdjacentCornerForC(cSquare) {
        const [x, y] = cSquare;
        if ((x === 0 && y === 1) || (x === 1 && y === 0))
            return [0, 0];
        if ((x === 0 && y === 6) || (x === 1 && y === 7))
            return [0, 7];
        if ((x === 6 && y === 0) || (x === 7 && y === 1))
            return [7, 0];
        if ((x === 6 && y === 7) || (x === 7 && y === 6))
            return [7, 7];
        return null;
    }
    getBoardHash(board) {
        let hash = '';
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                hash += board.tiles[y]?.[x] ?? E;
            }
        }
        return hash + board.playerTurn;
    }
    minimaxWithTT(board, depth, alpha, beta, isMaximizing) {
        this.nodesSearched++;
        if (this.shouldAbort()) {
            return evaluateBoardForPlayer(board, this.player);
        }
        const hash = this.getBoardHash(board);
        const ttEntry = this.transpositionTable.get(hash);
        if (ttEntry && ttEntry.depth >= depth) {
            if (ttEntry.flag === 'exact')
                return ttEntry.score;
            if (ttEntry.flag === 'lower')
                alpha = Math.max(alpha, ttEntry.score);
            else if (ttEntry.flag === 'upper')
                beta = Math.min(beta, ttEntry.score);
            if (alpha >= beta)
                return ttEntry.score;
        }
        const validMoves = getValidMoves(board);
        // Terminal: game over or no moves at this node
        if (validMoves.length === 0) {
            // Pass already handled in simulateMove; empty moves ⇒ evaluate terminal/heuristic
            return exactTerminalScore(board, this.player);
        }
        if (depth === 0) {
            return evaluateBoardForPlayer(board, this.player);
        }
        const orderedMoves = this.orderMoves(validMoves, board);
        const originalAlpha = alpha;
        let bestScore;
        let bestMove;
        if (isMaximizing) {
            bestScore = -Infinity;
            for (const move of orderedMoves) {
                if (this.shouldAbort())
                    break;
                const clonedBoard = this.cloneBoard(board);
                this.simulateMove(clonedBoard, move);
                const evaluation = this.minimaxWithTT(clonedBoard, depth - 1, alpha, beta, false);
                if (evaluation > bestScore) {
                    bestScore = evaluation;
                    bestMove = move;
                }
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha)
                    break;
            }
        }
        else {
            bestScore = Infinity;
            for (const move of orderedMoves) {
                if (this.shouldAbort())
                    break;
                const clonedBoard = this.cloneBoard(board);
                this.simulateMove(clonedBoard, move);
                const evaluation = this.minimaxWithTT(clonedBoard, depth - 1, alpha, beta, true);
                if (evaluation < bestScore) {
                    bestScore = evaluation;
                    bestMove = move;
                }
                beta = Math.min(beta, evaluation);
                if (beta <= alpha)
                    break;
            }
        }
        if (!this.searchAborted && this.transpositionTable.size < MAX_TT_SIZE) {
            let flag;
            if (bestScore <= originalAlpha)
                flag = 'upper';
            else if (bestScore >= beta)
                flag = 'lower';
            else
                flag = 'exact';
            this.transpositionTable.set(hash, {
                depth,
                score: bestScore,
                flag,
                bestMove,
            });
        }
        return bestScore;
    }
    cloneBoard(board) {
        return {
            tiles: board.tiles.map((row) => [...row]),
            playerTurn: board.playerTurn,
        };
    }
    /**
     * Apply a known-valid move using shared engine rules (pass handling included).
     */
    simulateMove(board, coord) {
        takeTurn(board, coord);
    }
}
