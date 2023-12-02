import * as THREE from 'three'

abstract class BaseShape extends THREE.LineSegments {
	private _speed = 1

	protected constructor(
		geometry: THREE.BufferGeometry,
		color: THREE.Color | number,
		wireframe: boolean = false
	) {
		if (wireframe) {
			geometry = new THREE.EdgesGeometry(geometry)
		}

		super(geometry, new THREE.LineBasicMaterial({ color }))
	}

	public setColor(color: number) {
		;(this.material as THREE.LineBasicMaterial).color.set(color)
	}

	public setSpeed(speed: number) {
		this._speed = speed
	}

	public get speed() {
		return this._speed
	}
}

class Sphere extends BaseShape {
	public constructor(
		size: number,
		color: number,
		segments?: { width: number; height: number },
		wireframe: boolean = false,
		position: [number, number, number] = [0, 0, 0]
	) {
		const geometry = new THREE.SphereGeometry(size, segments?.width || 16, segments?.height || 8)
		super(geometry, color, wireframe)
		this.position.set(...position)
	}
}

class Cube extends BaseShape {
	public constructor(
		size: number,
		color: THREE.Color | number,
		wireframe: boolean = false,
		position: [number, number, number] = [0, 0, 0]
	) {
		const geometry = new THREE.BoxGeometry(size, size, size)

		super(geometry, color, wireframe)
		this.position.set(...position)
	}
}

class Torus extends BaseShape {
	public constructor(
		radius: number,
		tube: number,
		color: number,
		wireframe: boolean = false,
		position: [number, number, number] = [0, 0, 0]
	) {
		const geometry = new THREE.TorusGeometry(radius, tube, 16, 100)

		super(geometry, color, wireframe)
		this.position.set(...position)
	}
}

function setupShape(
	type: 'cube',
	size: number,
	color: THREE.Color | number,
	wireframe?: boolean,
	position?: [number, number, number]
): BaseShape
function setupShape(
	type: 'sphere',
	size: number,
	color: THREE.Color | number,
	segments?: { width: number; height: number },
	wireframe?: boolean,
	position?: [number, number, number]
): BaseShape
function setupShape(
	type: 'torus',
	radius: number,
	tube: number,
	color: THREE.Color | number,
	wireframe?: boolean,
	position?: [number, number, number]
): BaseShape

function setupShape(type: string, ...params: any[]): BaseShape {
	let shape: BaseShape

	switch (type) {
		case 'cube':
			shape = new Cube(params[0], params[1], params[2], params[3])
			break
		case 'sphere':
			shape = new Sphere(params[0], params[1], params[2], params[3], params[4])
			break
		case 'torus':
			shape = new Torus(params[0], params[1], params[2], params[3], params[4])
			break
		default:
			throw new Error('Unknown shape type')
	}

	return shape
}

export { BaseShape, Cube, Sphere, Torus, setupShape }
