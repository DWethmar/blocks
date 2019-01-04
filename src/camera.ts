import * as PIXI from 'pixi.js';
import {Vector3D, viewPort} from './types';
import {GameObject} from './game-object';

// possibles axis to move the camera
enum AXIS {
    NONE = "none",
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical",
    BOTH = "both"
}

// http://jsfiddle.net/gfcarv/QKgHs/

export class Camera extends GameObject {

    public axis: AXIS;

    xDeadZone = 0;
    yDeadZone = 0;

    wView = 0;
    hView = 0;

    followed: GameObject;

    viewportRect: PIXI.Rectangle;
    worldRect: PIXI.Rectangle;

    constructor(
        public xView,
        public yView,
        public viewPort: viewPort,
        public world: viewPort
    ) {
        super([
            xView,
            yView,
            0
        ]);

        // position of camera (left-top coordinate)
        this.xView = xView || 0;
        this.yView = yView || 0;

        // distance from followed object to border before camera starts move
        this.xDeadZone = 0; // min distance to horizontal borders
        this.yDeadZone = 0; // min distance to vertical borders

        // viewport dimensions
        this.wView = viewPort.width;
        this.hView = viewPort.height;

        // allow camera to move in vertical and horizontal axis
        this.axis = AXIS.BOTH;

        // object that should be followed
        this.followed = null;

        // // rectangle that represents the viewport
        this.viewportRect = new PIXI.Rectangle(this.xView, this.yView, this.wView, this.hView);
        //
        // // rectangle that represents the world's boundary (room's boundary)
        this.worldRect = new PIXI.Rectangle(0, 0, world.width, world.height);
    }

    follow(gameObject: GameObject, xDeadZone: number, yDeadZone: number) {
        this.followed   = gameObject;
        this.xDeadZone  = xDeadZone;
        this.yDeadZone  = yDeadZone;
    }

    update(worldRect: PIXI.Rectangle) {

        this.worldRect = worldRect;

        // keep following the player (or other desired object)
        if (this.followed != null)
        {
            if (this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH)
            {
                // moves camera on horizontal axis based on followed object position
                if (this.followed.x - this.xView  + this.xDeadZone > this.wView) {
                    this.xView = this.followed.x - (this.wView - this.xDeadZone);
                } else if (this.followed.x  - this.xDeadZone < this.xView) {
                    this.xView = this.followed.x - this.xDeadZone;
                }

            }

            if (this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH) {
                // moves camera on vertical axis based on followed object position
                if (this.followed.y - this.yView + this.yDeadZone > this.hView) {
                    this.yView = this.followed.y - (this.hView - this.yDeadZone);
                }
                else if (this.followed.y - this.yDeadZone < this.yView) {
                    this.yView = this.followed.y - this.yDeadZone;
                }
            }

        }

        if (this.xView > 0) {
            console.log('LD');
        }

        // update viewportRect
        this.viewportRect.x = this.xView;
        this.viewportRect.y = this.yView;

        // don't let camera leaves the world's boundary
        if (
            !this.worldRect.contains(this.viewportRect.left, this.viewportRect.top) ||
            !this.worldRect.contains(this.viewportRect.right, this.viewportRect.bottom)
        ) {
            if (this.viewportRect.left < this.worldRect.left) {
                this.xView = this.worldRect.left;
            }

            if (this.viewportRect.top < this.worldRect.top) {
                this.yView = this.worldRect.top;
            }

            if (this.viewportRect.right > this.worldRect.right) {
                this.xView = this.worldRect.right - this.wView;
            }

            if (this.viewportRect.bottom > this.worldRect.bottom) {
                this.yView = this.worldRect.bottom - this.hView;
            }
        }
    }

}
