import interact from 'interactjs'
import Board from './board'
import Spin from './spin'

export default class Hole {
    private _el: HTMLDivElement
    private _board: Board
    private _eventMap: { [event: string]: ((e?: Event) => void)[] } = {}
    private _spin: Spin | null = null

    constructor(public x: number, public y: number, private prefix: number) {
        this.createElement()
        this.fill()
    }

    get hasSpin() {
        return Boolean(this._spin)
    }

    setBoard(board: Board) {
        this._board = board
    }

    private createElement() {
        const { x, y, prefix } = this
        const gutter = 70
        const el = document.createElement('div')
        el.className = 'hole'
        // el.ondragover = this.onDragOver.bind(this)
        // el.ondrop = this.onDrop.bind(this)
        el.style.left = `${x * gutter + prefix * gutter / 2}px`
        el.style.top = `${y * gutter}px`
        el.onclick = () => this.trigger('click')
        interact(el).dropzone({
            ondrop: this.onDrop.bind(this),
            ondragenter: this.onDrapEnter.bind(this),
            ondragleave: this.onDrapLeave.bind(this)
        })
        this._el = el
    }

    disableDrag() {
        this._spin?.disableDrag()
    }

    trigger(event: string, e?: Event) {
        (this._eventMap[event] || []).forEach(cb => cb(e))
    }

    on(event: string, cb: (e?: Event) => void) {
        if (this._eventMap[event]) {
            this._eventMap[event].push(cb)
        } else {
            this._eventMap[event] = [cb]
        }
    }

    onDrop(e: DragEvent) {
        this._el.classList.remove('can-drop', 'can-not-drop')
        this.trigger('move')
    }

    onDrapLeave() {
        this._el.classList.remove('can-drop', 'can-not-drop')
    }

    onDrapEnter(e: DragEvent) {
        const spanEl = e.relatedTarget as HTMLSpanElement
        this._board.dragSpin = spanEl

        if (this._board.canDrop(this)) {
            this._el.classList.add('can-drop')
        } else {
            this._el.classList.add('can-not-drop')
        }
    }


    fill() {
        if (this.hasSpin) {
            throw new Error('Spin has existed!')
        }
        const spin = new Spin(this.x, this.y)
        this._spin = spin
        this._el.append(spin.render())
    }

    unfill() {
        this._spin?.remove()
        this._spin = null
    }

    render() {
        return this._el
    }

    remove() {
        this._spin?.remove()
        this._el.remove()
    }
}
