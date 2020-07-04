import Hole from './hole'
import Action from './action'
import { Coordinate } from '.'

export default class Board {
    private _holes: Hole[]
    private _actions: Action[] = []
    private _unreviewedActions: Action[] = []
    private _inited = false
    private _el: Element

    dragSpin: HTMLSpanElement

    constructor(public floor = 5) {
        this.initHoles()
    }

    reset() {
        this._inited = false
        this._actions = []
        this._unreviewedActions = []
        this.initHoles()
        this._el.innerHTML = ''
        this._el.append(
            ...this._holes.map(hole => hole.render())
        )
    }

    undo() {
        const action = this._actions.pop()
        if (action) {
            action.undo(this)
        } else {
            this.reset()
        }
    }

    init(hole: Hole) {
        if (this._inited) return
        hole.unfill()
        this._inited = true
        this.renderResetButton()
        this.renderUndoButton()
    }

    initHoles() {
        const holes: Hole[] = []
        for (let y = 0; y < this.floor; ++y) {
            for (let x = 0; x <= y; ++x) {
                const hole = new Hole(x, y, this.floor - y)
                hole.setBoard(this)
                hole.on('click', () => this.init(hole))
                hole.on('move', () => this.onMove(hole))
                holes.push(hole)
            }
        }
        this._holes = holes
    }

    canDrop(hole: Hole) {
        if (hole.hasSpin) return false
        const x = Number(this.dragSpin.dataset.x)
        const y = Number(this.dragSpin.dataset.y)

        const deltaX = Math.abs(Number(x) - hole.x)
        const deltaY = Math.abs(Number(y) - hole.y)
        /**
         * 三种坐标
         * 0 0
         * 0 2
         * 2 2
         */
        if ((deltaX + deltaY === 2 && deltaX !== deltaY)
            || (deltaX === 2 && deltaY === 2)) {
            return this.getMiddleHole({ x, y }, hole).hasSpin
        }
        return false
    }

    onMove(targetHole: Hole) {
        if (!this.canDrop(targetHole)) return

        const from = {
            x: Number(this.dragSpin.dataset.x),
            y: Number(this.dragSpin.dataset.y)
        }
        const to = { x: targetHole.x, y: targetHole.y }
        const action = new Action(from, to)
        action.do(this)
        this._actions.push(action)
        if (this.isWin) {
            alert('You WIN! 现在可以进行复盘')
            this.renderReviewButton()
        }
    }

    getHole(coordinate: Coordinate) {
        const { x, y } = coordinate
        return this._holes[(1 + y) * y / 2 + x]
    }

    getMiddleHole(from: Coordinate, to: Coordinate) {
        const x = Math.abs(from.x + to.x) / 2
        const y = Math.abs(from.y + to.y) / 2
        return this.getHole({ x, y })
    }

    get isWin() {
        return this._holes.filter(hole => hole.hasSpin).length === 1
    }

    review() {
        document.getElementById('review')?.remove()
        this._holes.forEach(hole => hole.remove())
        this.initHoles()
        this._holes.forEach(hole => hole.disableDrag())
        this._el.append(
            ...this._holes.map(hole => hole.render())
        )
        this._unreviewedActions = this._actions
        this._actions = []
        this.renderNextButton()
    }

    next() {
        // 没有空孔, 即最初始的时候
        if (!this._holes.find(hole => !hole.hasSpin)) {
            this.getHole(this._unreviewedActions[0].to).unfill()
            return
        }
        const action = this._unreviewedActions.shift()
        if (action) {
            action.do(this)
            this._actions.push(action)
        }
    }

    renderReviewButton() {
        const btn = document.createElement('button')
        btn.id = 'review'
        btn.innerText = '复盘'
        btn.onclick = this.review.bind(this)
        this._el.append(btn)
    }

    renderNextButton() {
        const btn = document.createElement('button')
        btn.innerText = '前进'
        btn.onclick = this.next.bind(this)
        this._el.append(btn)
    }

    renderUndoButton() {
        const btn = document.createElement('button')
        btn.innerText = '回退'
        btn.onclick = this.undo.bind(this)
        this._el.append(btn)
    }

    renderResetButton() {
        const btn = document.createElement('button')
        btn.innerText = '重置'
        btn.onclick = this.reset.bind(this)
        this._el.append(btn)
    }

    render(id: string) {
        const container = document.getElementById(id)
        if (!container) {
            throw new Error(`Element ${id} not exist!`)
        }
        container.className = 'container'
        container.append(
            ...this._holes.map(hole => hole.render())
        )
        this._el = container
    }
}