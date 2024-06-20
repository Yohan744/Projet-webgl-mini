import * as THREE from 'three'
import Experience from './Experience.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from "gsap"
import {watch} from "vue";

export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.config = this.experience.config
        this.debug = this.experience.debug
        this.targetElement = this.experience.targetElement
        this.scene = this.experience.scene
        this.pointer = this.experience.pointer
        this.gameManager = this.experience.gameManager
        this.globalEvents = this.experience.globalEvents
        this.isMobile = this.experience.config.isMobile

        this.isFocused = false
        this.isMoving = false

        this.mousePos = {
            x: null,
            y: null
        }

        this.mode = 'default' // 'default' for production, 'debug' for development

        this.basicCameraPosition = new THREE.Vector3(0, 2.25, 9.5)
        this.basicLookingPoint = new THREE.Vector3(0, -0.25, -3)

        this.lookingPoint = this.getNormalizedLookingPoint(this.basicCameraPosition, this.basicLookingPoint)
        this.prevTarget = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.side = new THREE.Vector3();
        this.lookAtTarget = new THREE.Vector3();
        this.upVector = new THREE.Vector3(0, 1, 0);

        this.lerpCamera = 0
        this.cameraAmplitude = this.isMobile ? {x: 3.5, y: 2} : {x: 1.75, y: 1.25}
        this.lerpCameraNormal = 0.98
        this.cameraAmplitudeNormal = this.isMobile ? {x: 3.5, y: 2} : {x: 1.75, y: 1.25}
        this.lerpCameraFocus = 0.99
        this.cameraAmplitudeFocus = this.isMobile ? {x: 1, y: 1} : {x: 0.5, y: 0.5}
        this.movingSpeedMultiplier = 0.65
        this.originalPosition = null;
        this.originalLookAt = null;

        if (this.debug) {
            this.debugFolder = this.debug.addFolder({
                title: 'Camera',
                expanded: true
            })
            this.setDebug()
        }

        this.setInstance()
        this.setModes()
        this.setWatchers()
    }

    setInstance() {
        const width = this.config.width === null ? window.innerWidth : this.config.width
        this.instance = new THREE.PerspectiveCamera(50, width / this.config.height, 0.1, 50)
        this.instance.rotation.reorder('YXZ')
        this.instance.lookAt(this.lookingPoint);
        this.originalPosition = this.instance.position.clone();
        this.originalLookAt = this.lookingPoint.clone();

        this.scene.add(this.instance)
    }

    setModes() {
        this.modes = {}

        // Default
        this.modes.default = {}
        this.modes.default.instance = this.instance.clone()
        this.modes.default.instance.rotation.reorder('YXZ')
        this.modes.default.instance.position.copy(this.basicCameraPosition)
        this.modes.default.instance.lookAt(this.lookingPoint)

        // Debug
        this.modes.debug = {}
        this.modes.debug.instance = this.instance.clone()
        this.modes.debug.instance.rotation.reorder('YXZ')
        this.modes.debug.instance.position.set(0, 4, 4)

        this.modes.debug.orbitControls = new OrbitControls(this.modes.debug.instance, this.targetElement)
        this.modes.debug.orbitControls.enabled = this.modes.debug.active
        this.modes.debug.orbitControls.screenSpacePanning = true
        this.modes.debug.orbitControls.enableKeys = false
        this.modes.debug.orbitControls.zoomSpeed = 0.75
        this.modes.debug.orbitControls.enableDamping = true
        this.modes.debug.orbitControls.update()
    }

    setDebug() {
        if (this.debug) {
            this.debugFolder.addBinding(this, 'mode', {
                view: 'list',
                options: {Default: "default", Debug: "debug"},
                label: "Camera mode"
            });

            this.debugFolder.addBinding(this.cameraAmplitude, 'x', {
                view: 'slider',
                min: 0,
                max: 5,
                step: 0.001,
                label: "Camera amp X"
            })
            this.debugFolder.addBinding(this.cameraAmplitude, 'y', {
                view: 'slider',
                min: 0,
                max: 5,
                step: 0.001,
                label: "Camera amp Y"
            })

            this.debugFolder.addBinding(this, 'lerpCamera', {
                view: 'slider',
                min: 0,
                max: 0.99,
                step: 0.001,
                label: "Camera smooth"
            })

            const isFocusedInput = this.debugFolder.addBinding(this, 'isFocused', {
                view: 'checkbox',
                label: "Focus mode"
            })
            isFocusedInput.on('change', () => this.updateFocusMode(this.isFocused));
        }
    }

    setWatchers() {
        this.pointer.on('spot-clicked', (position, lookingPoint) => this.moveCamera(position, lookingPoint))

        if (this.pointer && this.mode === 'default') {
            this.pointer.on('movement', (mouse) => {
                this.mousePos = mouse
                this.onMovement()
            })
        }

        watch(() => this.gameManager.state.isCameraOnSpot, value => !value && this.moveCamera(this.basicCameraPosition, this.basicLookingPoint, 0.75, false))
        watch(() => this.gameManager.state.isSettingsOpen, (value) => this.updateFocusMode(value))
        watch(() => this.gameManager.state.isInteractingWithObject, (value) => this.updateFocusMode(value))

    }

    resize() {
        this.instance.aspect = this.config.width / this.config.height
        this.instance.updateProjectionMatrix()

        this.modes.default.instance.aspect = this.config.width / this.config.height
        this.modes.default.instance.updateProjectionMatrix()

        this.modes.debug.instance.aspect = this.config.width / this.config.height
        this.modes.debug.instance.updateProjectionMatrix()
    }

    moveCamera(position = false, lookingPoint = false, mult = 1, isGoingOnASpot = true, duration = 3) {
        let distanceToPoint = null

        if (position) {

            if (this.isMoving) return

            this.isMoving = true
            distanceToPoint = Math.round(position.distanceTo(this.modes.default.instance.position))

            gsap.to(this.modes.default.instance.position, {
                x: position.x,
                y: position.y + isGoingOnASpot ? this.basicCameraPosition.y : 0,
                z: position.z,
                duration: distanceToPoint * this.movingSpeedMultiplier * mult,
                ease: 'power1.inOut',
                onComplete: () => {
                    this.isMoving = false
                    if (isGoingOnASpot !== null) this.gameManager.updateCameraOnSpot(isGoingOnASpot)
                    if (!isGoingOnASpot) this.experience.world.locations.setLocationsVisibility(true)
                }
            });

        }

        if (lookingPoint) {

            const point = this.getNormalizedLookingPoint(position, lookingPoint)
            const d = distanceToPoint ? distanceToPoint * this.movingSpeedMultiplier * mult : duration

            gsap.to(this.lookingPoint, {
                x: point.x,
                y: point.y,
                z: point.z,
                duration: d,
                ease: 'power1.inOut'
            })

        }

    }

    updateFocusMode(value) {
        this.isFocused = value

        gsap.to(this.cameraAmplitude, {
            x: this.isFocused ? this.cameraAmplitudeFocus.x : this.cameraAmplitudeNormal.x,
            y: this.isFocused ? this.cameraAmplitudeFocus.y : this.cameraAmplitudeNormal.y,
            duration: 2,
            ease: 'power1.inOut'
        })

        gsap.to(this, {
            lerpCamera: this.isFocused ? this.lerpCameraFocus : this.lerpCameraNormal,
            duration: 2,
            ease: 'power1.inOut'
        })

    }

    getNormalizedLookingPoint(position, point) {
        const direction = new THREE.Vector3().copy(point);
        direction.normalize();
        return position.clone().add(direction.multiplyScalar(10));
    }

    updateLerpCameraAfterFirstFrame() {
        this.lerpCamera = this.lerpCameraNormal
    }

    onMovement() {
        this.direction.set(0, 0, 0);
        this.instance.getWorldDirection(this.direction);
        this.side.set(0, 0, 0).crossVectors(this.direction, this.upVector).normalize();
    }

    update() {
        if (this.mode === 'default') {
            this.lookAtTarget.set(0, 0, 0).copy(this.lookingPoint);
            this.lookAtTarget.addScaledVector(this.side, this.mousePos.x * this.cameraAmplitude.x);
            this.lookAtTarget.addScaledVector(this.upVector, this.mousePos.y * this.cameraAmplitude.y);

            this.modes.default.instance.lookAt(this.lookAtTarget.lerp(this.prevTarget, this.lerpCamera));
            this.prevTarget.copy(this.lookAtTarget);
        } else {
            if (this.debug) {
                this.modes.debug.orbitControls.update();
            }
        }

        this.instance.position.copy(this.modes[this.mode].instance.position);
        this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion);
    }

    destroy() {
        this.modes.debug.orbitControls.destroy()
        this.modes.default.instance.destroy()
        this.modes.debug.instance.destroy()
        if (this.debug) this.debugFolder.dispose()
        this.scene.remove(this.instance)
        this.pointer.off('spot-clicked', this.moveCamera)
        this.pointer.off('movement', this.onMovement)
    }
}
