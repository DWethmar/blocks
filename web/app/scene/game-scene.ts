import * as PIXI from 'pixi.js';

import { sortZYXAsc } from '../calc/sort';
import { createArch, createCheckers, createTerrainNoise, createTower } from '../terrain/terrain-utils';
import { BlockType } from '../block/block-type';
import { Scene } from './scene';
import { Terrain } from '../terrain/terrain';
import { addPos, bresenham3D, getX, getY, getZ, minusPos } from '../position/point-utils';
import { BLOCK_SIZE, CHUNK_SIZE } from '../config';
import { Player } from '../player/player';
import { Point3D, createPoint } from '../position/point';
import * as Viewport from 'pixi-viewport';
import * as Cull from 'pixi-cull';

export class GameScene extends Scene {
	readonly camera: Viewport;
	cull: any;

	terrain: Terrain;
	blockSelection: Point3D[];

	constructor(private stage: PIXI.Container) {
		super();

		this.camera = new Viewport({
			screenWidth: window.innerWidth,
			screenHeight: window.innerHeight,
			worldWidth: 1000,
			worldHeight: 1000
		});
		this.camera.sortableChildren = false;

		this.terrain = new Terrain(this.camera, this);
		this.gameObjectRepository.setGameObject(this.terrain);

		createCheckers(this.terrain, BlockType.GRASS, BlockType.VOID, createPoint());
		createTower(this.terrain, BlockType.ROCK, createPoint(17, 15, 1));
		createTower(this.terrain, BlockType.ROCK, createPoint(20, 18, 1));
		createArch(this.terrain, BlockType.ROCK, createPoint(6, 1, 1));

		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				createCheckers(
					this.terrain,
					BlockType.GRASS,
					BlockType.VOID,
					addPos(createPoint(CHUNK_SIZE, -1, 0), createPoint(CHUNK_SIZE * x, CHUNK_SIZE * y, 0))
				);
				createTerrainNoise(
					this.terrain,
					BlockType.GRASS,
					BlockType.ROCK,
					addPos(createPoint(CHUNK_SIZE, -1, 0), createPoint(CHUNK_SIZE * x, CHUNK_SIZE * y, 0))
				);
			}
		}

		this.terrain.addBlock(createPoint(0, 0, 1), BlockType.ROCK);
		this.terrain.addBlock(createPoint(1, 0, 1), BlockType.ROCK);
		this.terrain.addBlock(createPoint(2, 0, 1), BlockType.ROCK);
		this.terrain.addBlock(createPoint(3, 0, 1), BlockType.ROCK);
		this.terrain.addBlock(createPoint(2, 0, 1), BlockType.ROCK);

		this.terrain.addBlock(createPoint(8, 0, 1), BlockType.GRASS);
		this.terrain.addBlock(createPoint(11, 0, 1), BlockType.GRASS);
		this.terrain.addBlock(createPoint(CHUNK_SIZE, 0, 1), BlockType.VOID);

		this.gameObjectRepository.setGameObject(new Player('zoink', this.camera, createPoint(75, 10, 10)));
		this.gameObjectRepository.activateGameObject('zoink');

		// Test Line
		bresenham3D(1, 0, 10, 10, 0, 20).forEach((p) => this.terrain.addBlock(p, BlockType.SELECTION));

		this.stage.addChild(this.camera);

		this.camera.drag().pinch().wheel().decelerate();
		// .moveCenter(10, 10);

		this.cull = new Cull.Simple();
		this.cull.addList(this.camera.children);
		this.cull.cull(this.camera.getVisibleBounds());

		this.blockSelection = [];
	}

	update(delta: number) {
		this.gameObjectRepository.getActiveGameObjects().forEach((g) => g.update(delta));

		// Do own sorting
		this.camera.children.sort((a, b) => {
			const aZ = a.zIndex || 0;
			const bZ = b.zIndex || 0;
			return sortZYXAsc(createPoint(a.position.x, a.position.y, aZ), createPoint(b.position.x, b.position.y, bZ));
		});

		// if (this.camera.dirty) {
		//     this.cull.cull(this.camera.getVisibleBounds());
		//     this.camera.dirty = false;
		// }

		// this.selection();
	}

	selection() {
		if (this.blockSelection.length) {
			this.blockSelection.forEach((b) => this.terrain.removeBlock(b));
		}
		this.blockSelection = [];

		const bounds = this.camera.getVisibleBounds();
		const x = Math.floor(bounds.x + bounds.width / 2 / BLOCK_SIZE);
		const y = Math.floor(bounds.y + bounds.height / 2 / BLOCK_SIZE);

		const center: Point3D = createPoint(x, y);

		const crossDiameter = 10;

		const left = minusPos(center, createPoint(crossDiameter, 0, 0));
		const right = addPos(center, createPoint(crossDiameter, 0, 0));

		const north = minusPos(center, createPoint(0, 0, crossDiameter));
		const south = addPos(center, createPoint(0, 0, crossDiameter));

		const points: Point3D[] = [
			center, // center

			// Left -> right
			...bresenham3D(getX(left), getY(left), getZ(left), getX(right), getY(right), getZ(right)),

			// North -> South
			...bresenham3D(getX(north), getY(north), getZ(north), getX(south), getY(south), getZ(south))
		];

		points.forEach((p) => {
			if (!this.terrain.hasBlock(p)) {
				this.blockSelection.push(p);
				this.terrain.addBlock(p, BlockType.SELECTION);
			}
		});

		this.blockSelection = points;
	}
}

function intersects(a: PIXI.Rectangle, b: PIXI.Rectangle) {
	return (
		((a.x + a.width > b.x && a.x + a.width <= b.x + b.width) ||
			(b.x + b.width > a.x && b.x + b.width <= a.x + a.width)) &&
		((a.y + a.height > b.y && a.y + a.height <= b.y + b.height) ||
			(b.y + b.height > a.y && b.y + b.height <= a.y + a.height))
	);
}
