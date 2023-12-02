import './style.css'
import 'toolcool-range-slider'

import * as THREE from 'three'
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js'
//@ts-ignore

import { BaseShape, Cube, ShapeType, Sphere, Torus } from './shapes'
import { loadingScreen } from './loadingScreen'

interface EventWithDetail extends Event {
	detail?: any
}

let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: SVGRenderer

// Shape
let shape: BaseShape
let shapeType: ShapeType = 'sphere'

//Rotation
let shouldAnimateRotation = true

// Colors
let shouldAnimateColor = false
const color = new THREE.Color('#ffffff')
const initialColor = new THREE.Color('#ffdddd')
const targetColor = new THREE.Color('#242424')
let colorChangeSpeed = 0.1

// Scale
let shouldAnimateScale = true
const scaleAnimeRange = [3, 7]

//
let particles: THREE.Points
let lastTime = 0

const params = {
	cube: {
		size: 5,
		color: 0xff0000,
		wireframe: true
	},
	sphere: {
		size: 5,
		color: 0xff0000,
		segments: { width: 32, height: 16 },
		wireframe: false
	},
	torus: {
		radius: 4,
		tube: 1,
		color: 0xff0000,
		wireframe: true
	}
}

loadingScreen.show()
init()

function init() {
	camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 0.1, 50)
	camera.position.z = 20

	scene = new THREE.Scene()
	scene.background = new THREE.Color('rgb(36, 36, 36)')

	renderer = new SVGRenderer()
	renderer.setSize(window.innerWidth / 10, window.innerHeight / 10)

	const app = document.getElementById('app')
	app!.appendChild(renderer.domElement)
	window.addEventListener('resize', onWindowResize, false)

	// renderer.domElement.style.backgroundColor = ''
	// mountSVGFromString(getStringFromSVG(renderer.domElement))
	// downloadSVG(renderer.domElement, 'test.svg')
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth / 10, window.innerHeight / 10)
}

function animate(time: number = 0): void {
	requestAnimationFrame(animate)
	const deltaTime = (time - lastTime) / 1000
	lastTime = time

	shouldAnimateRotation && animateRotation(deltaTime)
	shouldAnimateColor ? animateColor() : (shape.material as THREE.LineBasicMaterial).color.set(color)
	shouldAnimateScale && animateScale(scaleAnimeRange[0], scaleAnimeRange[1])
	renderer.domElement.style.backgroundColor = ''

	renderer.render(scene, camera)
}

function animateColor() {
	if (shape.material instanceof THREE.LineBasicMaterial) {
		if (shape.material.color.getHexString() === targetColor.getHexString()) {
			const temp = targetColor.clone()
			targetColor.set(initialColor)
			initialColor.set(temp)
		}

		shape.material.color.lerp(targetColor, colorChangeSpeed)
	}
}

function animateScale(min: number, max: number) {
	const scale = (Math.sin(Date.now() * 0.001) + 1) * 0.5 * (max - min) + min

	const clampedScale = Math.max(1, Math.min(10, scale))

	renderer.setSize(
		(window.innerWidth / 10) * clampedScale,
		(window.innerHeight / 10) * clampedScale
	)
}
function animateRotation(deltaTime: number) {
	shape.rotation.x += (deltaTime * shape.speed.x) / 2
	shape.rotation.y += (deltaTime * shape.speed.y) / 2
}

function addParticles() {
	const particlesGeometry = new THREE.BufferGeometry()
	const particlesCnt = 5000 // Adjust as needed
	const posArray = new Float32Array(particlesCnt * 3)

	// Spread particles over a larger area
	for (let i = 0; i < particlesCnt * 3; i++) {
		posArray[i] = (Math.random() - 0.5) * 15
	}

	particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
	const particlesMaterial = new THREE.PointsMaterial({ size: 0.005, color: 0xffffff })
	const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial)
	scene.add(particleMesh)
	particles = particleMesh
}

function getStringFromSVG(svgElement: SVGElement) {
	const serializer = new XMLSerializer()
	const svgString = serializer.serializeToString(svgElement)
	return svgString
}

function downloadSVG(svgString: string, filename: string) {
	const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })

	const downloadLink = document.createElement('a')
	downloadLink.href = URL.createObjectURL(svgBlob)
	downloadLink.download = filename

	document.body.appendChild(downloadLink)
	downloadLink.click()
	document.body.removeChild(downloadLink)
}

function mountSVGFromString(svgString: string) {
	const container = document.createElement('div')
	container.id = 'svg-container'

	container.innerHTML = svgString

	const app = document.getElementById('app')
	app!.appendChild(container)
}

function updateShape() {
	scene.remove(shape)
	switch (shapeType) {
		case 'cube': {
			const { color, size, wireframe } = params.cube
			shape = new Cube(size, color, wireframe)
			document.getElementById('torusFields')!.style.display = 'none'
			document.getElementById('sphereFields')!.style.display = 'none'
			break
		}
		case 'sphere': {
			const { color, size, wireframe, segments } = params.sphere
			shape = new Sphere(size, color, { width: segments.width, height: segments.height }, wireframe)
			document.getElementById('torusFields')!.style.display = 'none'
			document.getElementById('sphereFields')!.style.display = 'block'
			break
		}
		case 'torus': {
			const { color, radius, tube, wireframe } = params.torus
			shape = new Torus(radius, tube, color, wireframe)
			document.getElementById('torusFields')!.style.display = 'block'
			document.getElementById('sphereFields')!.style.display = 'none'
			break
		}
		default:
			throw new Error('Unknown shape type')
	}
	scene.add(shape)
	renderer.render(scene, camera)
}

document.getElementById('shape')!.addEventListener('change', function () {
	if (this instanceof HTMLSelectElement) {
		shapeType = this.value as ShapeType
		updateShape()
	}
})

document.getElementById('edges')!.addEventListener('change', function () {
	if (this instanceof HTMLInputElement) {
		params[shapeType].wireframe = this.checked
		updateShape()
	}
})

document.getElementById('initialColor')!.addEventListener('input', function () {
	if (this instanceof HTMLInputElement) {
		initialColor.set(this.value)
	}
})
document.getElementById('targetColor')!.addEventListener('input', function () {
	if (this instanceof HTMLInputElement) {
		targetColor.set(this.value)
	}
})
document.getElementById('regularColor')!.addEventListener('input', function () {
	if (this instanceof HTMLInputElement) {
		color.set(this.value)
	}
})

document.getElementById('colorChangeSpeed')!.addEventListener('input', function () {
	if (this instanceof HTMLInputElement) {
		colorChangeSpeed = parseFloat(this.value)
		document.getElementById('colorChangeSpeedValue')!.textContent = this.value
	}
})

document.getElementById('shouldAnimateRotation')!.addEventListener('change', function () {
	if (this instanceof HTMLInputElement) {
		if (this.checked) {
			document.getElementById('animateRotationFields')!.style.display = 'block'
			document.getElementById('regularRotationFields')!.style.display = 'none'
		} else {
			document.getElementById('animateRotationFields')!.style.display = 'none'
			document.getElementById('regularRotationFields')!.style.display = 'block'
		}
		shouldAnimateRotation = this.checked
	}
})
document.getElementById('rotationXSpeed')!.addEventListener('change', (evt: EventWithDetail) => {
	const value = parseInt(evt.detail.value)
	shape.setSpeedX(value)
	document.getElementById('rotationXSpeedValue')!.textContent = value.toFixed(2)
})
document.getElementById('rotationYSpeed')!.addEventListener('change', (evt: EventWithDetail) => {
	const value = parseInt(evt.detail.value)
	console.log(value)
	shape.setSpeedY(value)
	document.getElementById('rotationYSpeedValue')!.textContent = value.toFixed(2)
})
document.getElementById('rotationX')!.addEventListener('change', (evt: EventWithDetail) => {
	const value = parseInt(evt.detail.value)
	shape.rotation.x = normalizeToRadians(value)
	document.getElementById('rotationXValue')!.textContent = value.toFixed(0)
})
document.getElementById('rotationY')!.addEventListener('change', (evt: EventWithDetail) => {
	const value = parseInt(evt.detail.value)
	shape.rotation.y = normalizeToRadians(value)
	document.getElementById('rotationYValue')!.textContent = value.toFixed(0)
})

document.getElementById('scale')!.addEventListener('change', (evt: EventWithDetail) => {
	const scale = parseInt(evt.detail.value)
	renderer.setSize((window.innerWidth / 10) * scale, (window.innerHeight / 10) * scale)
	document.getElementById('scaleValue')!.textContent = scale.toFixed(2)
})

document.getElementById('shouldAnimateColor')!.addEventListener('change', function () {
	if (this instanceof HTMLInputElement) {
		if (this.checked) {
			document.getElementById('animateColorFields')!.style.display = 'block'
			document.getElementById('regularColorFields')!.style.display = 'none'
		} else {
			document.getElementById('animateColorFields')!.style.display = 'none'
			document.getElementById('regularColorFields')!.style.display = 'block'
		}
		shouldAnimateColor = this.checked
	}
})

document.getElementById('shouldAnimateScale')!.addEventListener('change', function () {
	if (this instanceof HTMLInputElement) {
		if (this.checked) {
			document.getElementById('animateScaleFields')!.style.display = 'block'
			document.getElementById('regularScaleFields')!.style.display = 'none'
		} else {
			document.getElementById('animateScaleFields')!.style.display = 'none'
			document.getElementById('regularScaleFields')!.style.display = 'block'
		}
		shouldAnimateScale = this.checked
	}
})

document.getElementById('scale-range')!.addEventListener('change', (evt: EventWithDetail) => {
	scaleAnimeRange[0] = parseInt(evt.detail.value1)
	scaleAnimeRange[1] = parseInt(evt.detail.value2)
	document.getElementById('rangeScaleMin')!.innerText = scaleAnimeRange[0].toString()
	document.getElementById('rangeScaleMax')!.innerText = scaleAnimeRange[1].toString()
})
document.getElementById('shouldAddParticles')!.addEventListener('change', function () {
	if (this instanceof HTMLInputElement) {
		this.checked ? addParticles() : scene.remove(particles)
	}
})

document.getElementById('radius')!.addEventListener('change', (evt: EventWithDetail) => {
	const value = parseInt(evt.detail.value)
	params.torus.radius = value
	updateShape()
	document.getElementById('radiusValue')!.textContent = evt.detail.value
})
document.getElementById('tube')!.addEventListener('change', (evt: EventWithDetail) => {
	const value = parseInt(evt.detail.value)
	params.torus.tube = value
	updateShape()
	document.getElementById('tubeValue')!.textContent = evt.detail.value
})
document.getElementById('widthSegments')!.addEventListener('change', (evt: EventWithDetail) => {
	const value = parseInt(evt.detail.value)
	params.sphere.segments.width = value
	updateShape()
	document.getElementById('widthSegmentsValue')!.textContent = evt.detail.value
})
document.getElementById('heightSegments')!.addEventListener('change', (evt: EventWithDetail) => {
	const value = parseInt(evt.detail.value)
	params.sphere.segments.height = value
	updateShape()
	document.getElementById('heightSegmentsValue')!.textContent = evt.detail.value
})

window.onload = function () {
	const animateColorCheckbox = document.getElementById('shouldAnimateColor')
	animateColorCheckbox!.dispatchEvent(new Event('change'))

	const animateRotation = document.getElementById('shouldAnimateRotation')
	animateRotation!.dispatchEvent(new Event('change'))

	const animateScale = document.getElementById('shouldAnimateScale')
	animateScale!.dispatchEvent(new Event('change'))

	const shape = document.getElementById('shape')
	shape!.dispatchEvent(new Event('change'))

	const scale = document.getElementById('scale')
	scale!.dispatchEvent(new Event('input'))

	animate()

	loadingScreen.hide()
}

function degreesToRadians(degrees: number) {
	return degrees * (Math.PI / 180)
}

function normalize(
	value: number,
	originalMin: number,
	originalMax: number,
	newMin: number = 0,
	newMax: number = 1
): number {
	const ratio = (value - originalMin) / (originalMax - originalMin)
	return newMin + ratio * (newMax - newMin)
}

function normalizeToRadians(degree: number): number {
	return normalize(degree, 0, 360, 0, 2 * Math.PI)
}
