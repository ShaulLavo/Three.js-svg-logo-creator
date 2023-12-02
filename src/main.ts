import './style.css'
import * as THREE from 'three'
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js'
import { BaseShape, setupShape } from './shapes'
import { loadingScreen } from './loadingScreen'

let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: SVGRenderer
let shape: BaseShape

let lastTime = 0
const color = new THREE.Color('#ffffff')
const initialColor = new THREE.Color('#ffdddd')
const targetColor = new THREE.Color('#7f7f7f')
let colorChangeSpeed = 0.1

let shouldAnimateRotation = true
let shouldAnimateColor = true
let shouldAnimateScale = true
let shouldAddParticles = false

// loadingScreen.show()

init()
animate()

function init() {
	camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 0.1, 50)
	camera.position.z = 20

	scene = new THREE.Scene()
	scene.background = new THREE.Color('rgb(36, 36, 36)')

	renderer = new SVGRenderer()
	renderer.setSize(window.innerWidth / 4, window.innerHeight / 4)

	const app = document.getElementById('app')
	app!.appendChild(renderer.domElement)
	window.addEventListener('resize', onWindowResize, false)
	console.log(renderer.domElement)
	shouldAddParticles && addParticles()
	shape = setupShape('sphere', 5, initialColor, { width: 16, height: 8 }, false, [0, 0, 0])
	scene.add(shape)
	renderer.render(scene, camera)
	// renderer.domElement.style.backgroundColor = ''
	// mountSVGFromString(getStringFromSVG(renderer.domElement))
	// downloadSVG(renderer.domElement, 'test.svg')
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth / 4, window.innerHeight / 4)
}

function animate(time: number = 0): void {
	requestAnimationFrame(animate)
	const deltaTime = (time - lastTime) / 1000
	lastTime = time

	shouldAnimateRotation && animateRotation(deltaTime)
	shouldAnimateColor ? animateColor() : (shape.material as THREE.LineBasicMaterial).color.set(color)
	shouldAnimateScale && animateScale()
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

function animateScale() {
	const scale = Math.sin(Date.now() * 0.001) * 0.5 + 1

	// shape.scale.set(scale, scale, scale)
	renderer.setSize((window.innerWidth / 4) * scale, (window.innerHeight / 4) * scale)
}

function animateRotation(deltaTime: number) {
	const rotation = (deltaTime * shape.speed) / 2
	shape.rotation.x += rotation
	shape.rotation.y += rotation
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
	return () => scene.remove(particleMesh)
}

function getStringFromSVG(svgElement: SVGElement) {
	const serializer = new XMLSerializer()
	const svgString = serializer.serializeToString(svgElement)
	return svgString
}

function downloadSVG(svgString: string, filename: string) {
	// Create a Blob from the SVG string
	const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })

	// Create a download link
	const downloadLink = document.createElement('a')
	downloadLink.href = URL.createObjectURL(svgBlob)
	downloadLink.download = filename

	// Append the link to the document, trigger the download, and then remove the link
	document.body.appendChild(downloadLink)
	downloadLink.click()
	document.body.removeChild(downloadLink)
}

function mountSVGFromString(svgString: string) {
	const container = document.createElement('div')
	container.id = 'svg-container'

	// Set the inner HTML of the container to the SVG string
	container.innerHTML = svgString

	// Append the container to a specified parent element
	const app = document.getElementById('app')
	app!.appendChild(container)
}

document.getElementById('shape')!.addEventListener('change', function () {
	if (this instanceof HTMLSelectElement) {
		console.log(this.value)
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
		console.log(this.value)
	}
})

document.getElementById('shouldAnimateRotation')!.addEventListener('change', function () {
	if (this instanceof HTMLInputElement) {
		shouldAnimateRotation = this.checked
		console.log(this.checked)
	}
})

document.getElementById('shouldAnimateColor')!.addEventListener('change', function () {
	if (this instanceof HTMLInputElement) {
		if (this.checked) {
			document.getElementById('animateColorFields')!.style.display = 'block'
			document.getElementById('regularColorField')!.style.display = 'none'
		} else {
			document.getElementById('animateColorFields')!.style.display = 'none'
			document.getElementById('regularColorField')!.style.display = 'block'
		}
		shouldAnimateColor = this.checked
		console.log(this.checked)
	}
})

document.getElementById('shouldAnimateScale')!.addEventListener('change', function () {
	if (this instanceof HTMLInputElement) {
		shouldAnimateScale = this.checked
		console.log(this.checked)
	}
})

document.getElementById('shouldAddParticles')!.addEventListener('change', function () {
	if (this instanceof HTMLInputElement) {
		shouldAddParticles = this.checked
		console.log(this.checked)
	}
})

window.onload = function () {
	let animateColorCheckbox = document.getElementById('shouldAnimateColor')
	animateColorCheckbox!.dispatchEvent(new Event('change'))
	loadingScreen.hide()
}
