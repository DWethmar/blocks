import * as PIXI from "pixi.js";

import { BLOCK_SIZE, CHUNK_SIZE } from "./config";
import { divideBy } from "./utils/calc";
import { chunkSelector, Vector3D } from "./types";
import { Block, BlockType } from "./block";
import { addPos } from "./utils/position";
import { GameObject } from "./game-object";
import { sortZYXAsc } from "./utils/sort";
import { LightenDarkenColor } from "./utils/color";
import { createLineGraphic } from "./utils/graphics";
import { getBlockId, getChunkId } from "./utils/id";
import { getVisibleBlocks, isPositionWithinChunk } from "./utils/chunk";
import {Terrain} from "./terrain";

export class Chunk extends GameObject {
  readonly blocks: Map<string, Block> = new Map<string, Block>();

  public blocksToRender: string[] = [];
  public hasChanged = false;

  get chunkPosition(): Vector3D {
    return <Vector3D>(
      chunkDivider(CHUNK_SIZE * BLOCK_SIZE)(this.position).map(a =>
        Math.floor(a)
      )
    );
  }

  get worldPosition(): Vector3D {
    return <Vector3D>(
      chunkDivider(BLOCK_SIZE)(this.position).map(a => Math.floor(a))
    );
  }

  /**
   * layers are the cross-section of a chunk on the Y axis (back to front).
   */
  private layers: PIXI.Container[] = [];

  constructor(
    readonly stage: PIXI.Container,
    readonly terrain: Terrain,
    readonly position: Vector3D
  ) {
    super(position);

    const rect = new PIXI.Graphics();
    rect.lineStyle(1, 0x000);

    rect.interactive = true;
    rect.hitArea = new PIXI.Rectangle(
      this.x,
      this.y,
      CHUNK_SIZE * BLOCK_SIZE,
      CHUNK_SIZE * BLOCK_SIZE * 2
    );
    rect.renderable = false;

    rect.on("click", (event: any) =>
      this.click(event.data.getLocalPosition(rect))
    );

    stage.addChild(rect);
  }

  private click(p: PIXI.Point) {
    const x = p.x;
    let y = 0;
    let z = 0;

    if (p.y > CHUNK_SIZE * BLOCK_SIZE) {
      // click on front
      z = CHUNK_SIZE * BLOCK_SIZE * 2 - p.y;
      y = CHUNK_SIZE * BLOCK_SIZE;
    } else {
      z = CHUNK_SIZE * BLOCK_SIZE * 2 - p.y; // click on ceil
      y = CHUNK_SIZE * BLOCK_SIZE;
    }

    const worldPos = <Vector3D>(
      divideBy(BLOCK_SIZE, [x, y, z]).map(i => Math.floor(i))
    );

    const dir = <Vector3D>[0, -1, -1];
    const hit = this.raycast(addPos(worldPos, dir), dir);

    if (hit) {
      const blockPos = <Vector3D>(
        hit.position
          .map(i => Math.round(i / BLOCK_SIZE))
          .map(i => i * BLOCK_SIZE)
      );

      const nb = this.createBlock(
        addPos(blockPos, [0, 0, BLOCK_SIZE]),
        BlockType.VOID
      );
      console.log(nb);
    }
  }

  update(delta: number) {
    if (!this.hasChanged) {
      return;
    }

    this.blocksToRender = getVisibleBlocks(this);

    // Sort
    this.blocksToRender.sort((idA, idB) => {
      return sortZYXAsc(
        this.blocks.get(idA).position,
        this.blocks.get(idB).position
      );
    });

    const blockGraphics: PIXI.Graphics[] = [];

    this.blocksToRender.forEach(id => {
      const block = this.blocks.get(id);

      const index = block.y + BLOCK_SIZE;

      let graphics = null;

      if (blockGraphics[index]) {
        graphics = blockGraphics[index];
      } else {
        graphics = new PIXI.Graphics();
        graphics.zIndex = Math.floor(index);
        blockGraphics[index] = graphics;
      }
      this.renderBlock(block, graphics);
      this.renderLines(block, graphics);
    });

    // Clear that shit.
    this.layers.forEach(l => l.removeChildren());

    blockGraphics.forEach((graphics, i) => {
      let layer = null;
      if (this.layers[i]) {
        layer = this.layers[i];
      } else {
        layer = new PIXI.Container();
        layer.zIndex = (<any>graphics).zIndex;
        layer.position.set(this.x, this.y);
        this.layers[i] = layer;
        this.stage.addChild(layer);
      }

      // let img = new PIXI.Sprite(graphics.generateCanvasTexture());
      // img.position.set(graphics.x, (layer.zIndex) + (BLOCK_SIZE * CHUNK_SIZE) - graphics.height);
      // img.width = graphics.width;
      // img.height = graphics.height;
      //
      // console.log(graphics.position);

      layer.addChild(graphics);
    });

    this.hasChanged = false;
  }

  private renderBlock(block: Block, graphics: PIXI.Graphics) {
    let lighten = 0;

    const drawX = block.drawX - this.x;
    const drawY = block.drawY - this.y;

    const neighbors = {
      front: !this.isEmpty(addPos(block.worldPosition, [0, 1, 0]))
    };

    if (!neighbors.front) {
      let frontColor = null;
      // Front
      switch (block.type) {
        case BlockType.ROCK:
          frontColor = 0x5a5a5a;
          break;
        case BlockType.GRASS:
          frontColor = 0x795128;
          break;
        default:
          frontColor = 0x9e34a1;
          break;
      }
      graphics.beginFill(LightenDarkenColor(frontColor, lighten));
      graphics.drawRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
      graphics.endFill();
    }

    let topColor = null;
    // Top
    switch (block.type) {
      case BlockType.ROCK:
        topColor = 0xa5a5a5;
        break;
      case BlockType.GRASS:
        topColor = 0x008000;
        break;
      default:
        topColor = 0xff00d1;
        break;
    }
    graphics.beginFill(LightenDarkenColor(topColor, lighten));
    graphics.drawRect(drawX, drawY - BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    graphics.endFill();
  }

  private renderLines(block: Block, graphics: PIXI.Graphics) {
    const drawX = block.drawX - this.x;
    const drawY = block.drawY - this.y;

    const neighbors = {
      left: !this.isEmpty(addPos(block.worldPosition, [-1, 0, 0])),
      right: !this.isEmpty(addPos(block.worldPosition, [1, 0, 0])),
      front: !this.isEmpty(addPos(block.worldPosition, [0, 1, 0])),
      top: !this.isEmpty(addPos(block.worldPosition, [0, 0, 1])),
      back: !this.isEmpty(addPos(block.worldPosition, [0, -1, 0])),
      frontBottom: !this.isEmpty(addPos(block.worldPosition, [0, 1, -1])),
      bottom: !this.isEmpty(addPos(block.worldPosition, [0, 0, -1]))
    };

    const lineColor = 0x000000;
    const lines = [];
    if (!neighbors.top) {
      if (!neighbors.left) {
        lines.push(
          createLineGraphic(
            drawX,
            drawY - BLOCK_SIZE,
            0,
            0,
            0,
            BLOCK_SIZE,
            lineColor
          )
        );
      }

      if (!neighbors.right) {
        lines.push(
          createLineGraphic(
            drawX + BLOCK_SIZE,
            drawY - BLOCK_SIZE,
            0,
            0,
            0,
            BLOCK_SIZE,
            lineColor
          )
        );
      }

      if (!neighbors.back) {
        lines.push(
          createLineGraphic(
            drawX,
            drawY - BLOCK_SIZE,
            0,
            0,
            BLOCK_SIZE,
            0,
            lineColor
          )
        );
      }
    }

    if (!neighbors.front) {
      if (!neighbors.left) {
        lines.push(
          createLineGraphic(
              drawX,
              drawY,
              0,
              0,
              0,
              BLOCK_SIZE,
              lineColor
          )
        );
      }

      if (!neighbors.right) {
        lines.push(
          createLineGraphic(
            drawX + BLOCK_SIZE,
            drawY,
            0,
            0,
            0,
            BLOCK_SIZE,
            lineColor
          )
        );
      }
    }
    const linesContainer = new PIXI.Container();
    lines.forEach(l => linesContainer.addChild(l));
    graphics.addChild(linesContainer);
  }

  isEmpty(position: Vector3D): boolean {
    const block = this.getBlock(position);
    return block ? block.transparent : true;
  }

  getBlock(worldPosition: Vector3D): Block | null {
    if (isPositionWithinChunk(worldPosition, this)) {
      return this.blocks.has(getBlockId(worldPosition))
        ? this.blocks.get(getBlockId(worldPosition))
        : new Block(BlockType.AIR, worldPosition);
    }
    const otherChunk = this.terrain.getChunk(<Vector3D>chunkDivider(CHUNK_SIZE)(worldPosition));
    return otherChunk ? otherChunk.getBlock(worldPosition) : null;
  }

  createBlock(position: Vector3D, type: BlockType): Block {
    const block = new Block(type, position);
    this.blocks.set(getBlockId(block.worldPosition), block);
    this.hasChanged = true;

    this.terrain.triggerSurroundingChunk(this.chunkPosition);

    return block;
  }

  deleteBlock(position: Vector3D): Block {
    const block = this.getBlock(position);
    if (block) {
      this.blocks.delete(getBlockId(position));
    }
    this.hasChanged = true;
    return block;
  }

  raycast(start: Vector3D, direction: Vector3D): Block | null {
    const block = this.getBlock(start);

    if (block) {
      if (block.type !== BlockType.AIR) {
        return block;
      }
    } else {
      return null;
    }

    return this.raycast(addPos(start, direction), direction);
  }

  getCenter(): PIXI.Point {
    return new PIXI.Point(
      this.x + (CHUNK_SIZE * BLOCK_SIZE) / 2,
      this.y - this.z + (CHUNK_SIZE * BLOCK_SIZE) / 2
    );
  }
}

export const chunkDivider = (size: number) => (i: number[]) =>
  divideBy(size, i).map(i => Math.floor(i));
