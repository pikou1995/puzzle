import interact from 'interactjs'
import { Interactable } from '@interactjs/core/Interactable'

export default class Spin {
    private _el: HTMLSpanElement
    private handler: Interactable
    private dx: number = 0
    private dy: number = 0

    constructor(public x: number, public y: number) {
        this.init()
    }

    createElement() {
        const { x, y } = this
        const spin = document.createElement('span')
        spin.className = 'spin'
        spin.setAttribute('data-x', String(x))
        spin.setAttribute('data-y', String(y))
        this._el = spin
    }

    init() {
        this.createElement()
        this.enableDrag()
    }

    remove() {
        this.handler.unset()
        this._el.remove()
    }

    disableDrag() {
        this.handler.unset()
    }

    enableDrag() {
        const spin = this._el
        this.handler = interact(spin).draggable({
            listeners: {
                move: (e: { dx: number, dy: number }) => {
                    const x = this.dx + e.dx
                    const y = this.dy + e.dy

                    spin.style.webkitTransform
                        = spin.style.transform
                        = `translate(${x}px, ${y}px)`

                    this.dx = x
                    this.dy = y
                },
                end: () => {
                    spin.style.webkitTransform = spin.style.transform = ''
                    this.dx = 0
                    this.dy = 0
                }
            }
        })
    }

    render() {
        return this._el
    }
}
