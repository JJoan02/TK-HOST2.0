export declare class TicTacToe {
    /* Nombre del jugador que usa el símbolo X */
    playerX: string;
    /* Nombre del jugador que usa el símbolo O */
    playerY: string;
    /* true si es el turno del jugador X, false si es el turno del jugador O */
    private _currentTurn: boolean;
    /* Estado del tablero representado como una matriz 3x3 */
    private _board: number[][];
    /* Número total de turnos jugados */
    private _turns: number;

    /**
     * Crea una instancia del juego Tic-Tac-Toe con los nombres de los jugadores.
     * @param playerX - Nombre del jugador X.
     * @param playerY - Nombre del jugador O.
     */
    constructor(playerX: string, playerY: string) {
        this.playerX = playerX;
        this.playerY = playerY;
        this._currentTurn = true; // El turno inicial es del jugador X
        this._board = Array(3).fill(null).map(() => Array(3).fill(0)); // Inicializa un tablero vacío
        this._turns = 0;
    }

    /**
     * Obtiene el estado actual del tablero.
     * @returns Un arreglo 2D que representa el estado del tablero.
     */
    get board(): number[][] {
        return this._board;
    }

    /**
     * Realiza un movimiento en el tablero dado un índice lineal.
     * @param player - El jugador que realiza el movimiento (debe ser 'X' o 'O').
     * @param index - El índice lineal en el tablero (0-8).
     * @returns true si el movimiento fue exitoso, false si no lo fue.
     */
    turn(player: 'X' | 'O', index: number): boolean {
        const x = Math.floor(index / 3);
        const y = index % 3;
        return this.turn(player, x, y);
    }

    /**
     * Realiza un movimiento en el tablero dado un par de coordenadas (x, y).
     * @param player - El jugador que realiza el movimiento (debe ser 'X' o 'O').
     * @param x - La coordenada x en el tablero (0-2).
     * @param y - La coordenada y en el tablero (0-2).
     * @returns true si el movimiento fue exitoso, false si no lo fue.
     */
    turn(player: 'X' | 'O', x: number, y: number): boolean {
        if (x < 0 || x >= 3 || y < 0 || y >= 3) {
            return false; // Coordenadas fuera del tablero
        }
        if (this._board[x][y] !== 0) {
            return false; // La celda ya está ocupada
        }
        if ((player === 'X' && !this._currentTurn) || (player === 'O' && this._currentTurn)) {
            return false; // No es el turno del jugador
        }
        
        this._board[x][y] = player === 'X' ? 1 : 2; // Marca el tablero con el símbolo del jugador
        this._turns++;
        this._currentTurn = !this._currentTurn; // Cambia el turno
        return true;
    }
}
