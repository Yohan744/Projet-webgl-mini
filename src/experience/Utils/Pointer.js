import Experience from "../Experience";
import {Raycaster} from "three";
import EventEmitter from "./EventEmitter";

export default class Pointer extends EventEmitter {
    static instance

    constructor() {
        super()

        if (Pointer.instance) {
            return Pointer.instance
        }
        Pointer.instance = this

        this.experience = new Experience()
        this.gameManager = this.experience.gameManager
        this.globalEvents = this.experience.globalEvents

        this.raycaster = new Raycaster()
        this.triggerMovementTreshold = 0.035

        this.projectorMesh = []

        this.mouse = {
            x: 0,
            y: 0
        }

        this.oldMouse = {
            x: 0,
            y: 0
        }

        this.experience.on('ready', async () => {
            await this.setEvents()
        })

    }

    setEvents() {
        window.addEventListener("pointermove", this.onMovement.bind(this))
        window.addEventListener('pointerup', this.onClickRelease.bind(this));
    }

    onMovement(_event) {
        this.updateMousePosition(_event)

        const deltaX = Math.abs(this.mouse.x - this.oldMouse.x);
        const deltaY = Math.abs(this.mouse.y - this.oldMouse.y);

        if (deltaX > this.triggerMovementTreshold || deltaY > this.triggerMovementTreshold) {
            this.trigger('movement', [this.mouse]);
        }

        if (this.gameManager.state.isInteractingWithObject) {
            this.trigger('movement-orbit', [this.mouse]);
        }

        if (this.gameManager.state.gameStepId === 0) {
            this.trigger('movement-picture');
        }

    }

    onClickRelease() {
        this.trigger('click-release')
    }

    updateMousePosition(_event) {
        this.oldMouse.x = this.mouse.x
        this.oldMouse.y = this.mouse.y

        this.mouse.x = (_event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(_event.clientY / window.innerHeight) * 2 + 1
    }

    destroy() {
        Pointer.instance = null
        window.removeEventListener("pointermove", (_event) => this.onMovement(_event))
        window.removeEventListener('pointerup', this.onClickRelease.bind(this), false);
    }

}