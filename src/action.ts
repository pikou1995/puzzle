import { Coordinate } from '.'
import Board from './board'

export default class Action {
    constructor(public readonly from: Coordinate, public readonly to: Coordinate) {
    }

    do(board: Board) {
        board.getMiddleHole(this.from, this.to).unfill()
        board.getHole(this.from).unfill()
        board.getHole(this.to).fill()
    }

    undo(board: Board) {
        board.getHole(this.from).fill()
        board.getHole(this.to).unfill()
        board.getMiddleHole(this.from, this.to).fill()
    }
}
