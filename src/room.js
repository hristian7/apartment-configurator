/* global THREE AFRAME */

import * as planar from './geometry/planar';
import {deepClone, enableShadows} from './utils';
import {EPS} from './constants';

function toJSON(v) {
    return JSON.stringify(v);
}
export function fixExportSchema() {
    const wind = AFRAME.components['io3d-window'].schema;
    wind.columnRatios.stringify = toJSON;
    wind.rowRatios.stringify = toJSON;
}

function toPlanar(vec3) {
    return new THREE.Vector2(vec3.x, vec3.z);
}

function calcFloorWorld(floor) {
    const poly = floor.getAttribute('io3d-polyfloor').polygon;

    const mat = floor.object3D.matrix;
    
    floor.polyWorld = poly.map(p => {
        const vec = new THREE.Vector3(p[0], 0, p[1]);
        vec.applyMatrix4(mat);
        return toPlanar(vec);
    });

    floor.polyWorld.push(floor.polyWorld[0].clone());
}

function calcWallWorld(wall) {
    const mat = wall.object3D.matrix;
    const matLocal = new THREE.Matrix4().getInverse(mat);
    const info = wall.getAttribute('io3d-wall');
    let botLeft = new THREE.Vector3(0, 0, 0);
    const botRight = new THREE.Vector3(info.l, 0, 0);
    const topLeft = new THREE.Vector3(0, 0, info.w);
    const topRight = new THREE.Vector3(info.l, 0, info.w);

    botLeft.applyMatrix4(mat);
    botRight.applyMatrix4(mat);
    topLeft.applyMatrix4(mat);
    topRight.applyMatrix4(mat);

    wall.frontWorld = [botLeft, botRight].map(toPlanar);
    wall.backWorld = [topLeft, topRight].map(toPlanar);
    wall.mat = mat;
    wall.matLocal = matLocal;
}

function firstIntersection(wall, floors) {
    for(let i=0; i<floors.length; ++i) {
        const poly = floors[i].polyWorld;
        for(let j=1; j<poly.length; ++j) {
            const segment = [poly[j-1], poly[j]];
            const iFront = planar.segmentIntersectionInside(wall.frontWorld, segment);
            if(iFront != null) {
                return iFront;
            }
            const iBack = planar.segmentIntersectionInside(wall.backWorld, segment);
            if(iBack != null) {
                return iBack;
            }
        }
    }

    return null;
}

function processInfo(type, info) {
    const schema = AFRAME.components[type].schema;
    const unneededKeys = Object.keys(info).filter(k => schema[k] == null);
    unneededKeys.forEach(k => delete info[k]);
    const processedInfo = AFRAME.schema.stringifyProperties(info, schema);
    
    return AFRAME.utils.styleParser.stringify(processedInfo);
}

function wallFragment(wall, cutoff, left) {
    const info = wall.getAttribute('io3d-wall');

    const newWall = document.createElement('a-entity');
    enableShadows(newWall);

    let newPos;
    let newLen;
    if(left) {
        newLen = cutoff;
        newPos = wall.getAttribute('position');
    } else {
        newLen = info.l - cutoff;
        newPos = new THREE.Vector3(cutoff, 0, 0);
        newPos.applyMatrix4(wall.mat);
        newPos.add(new THREE.Vector3(wall.getAttribute('position')));    
    }
    
    const newInfo = deepClone(info);
    newInfo.l = newLen;

    const stringified = processInfo('io3d-wall', newInfo);
    newWall.setAttribute('position', newPos);
    newWall.setAttribute('rotation', wall.getAttribute('rotation'));
    newWall.setAttribute('io3d-wall', stringified);

    Array.from(wall.children).forEach(c => {
        let key; 
        let info;
        ['io3d-door', 'io3d-window'].forEach(k => {
            if(c.hasAttribute(k)) {
                key = k;
            }
        });
        if(key == null) {
            console.log("Unknown wall child: ", c);
            return;
        }
        info = c.getAttribute(key);

        if(info.x < cutoff !== left) { // A clever way to say the object is on the opposite side of where we're cutting off
            return;
        }

        const newInfo = deepClone(info);
        const stringified = processInfo(key, newInfo);

        const pos = c.getAttribute('position');
        const newPos = new THREE.Vector3(pos.x, pos.y, pos.z);
        if(!left) {
            newPos.x -= cutoff;
        }

        const newChild = document.createElement('a-entity');
        newChild.setAttribute('position', newPos);
        newChild.setAttribute('rotation', c.getAttribute('rotation'));
        newChild.setAttribute('scale', c.getAttribute('scale'));
        newChild.setAttribute('io3d-uuid', c.getAttribute('io3d-uuid'));
        newChild.setAttribute(key, stringified);
        enableShadows(newChild);
        newWall.appendChild(newChild);

    });

    return newWall;
}

function splitWallIfNeeded(wall, floors) {
    const intersection = firstIntersection(wall, floors);

    if(intersection == null) {
        return null;
    }
        
    const iVec = new THREE.Vector3(intersection.x, 0, intersection.y);
            
    iVec.applyMatrix4(wall.matLocal);

    const cutoff = iVec.x;

    const leftWall = wallFragment(wall, cutoff, true);
    const rightWall = wallFragment(wall, cutoff, false);
    wall.parentNode.appendChild(leftWall);
    wall.parentNode.appendChild(rightWall);
    wall.parentNode.removeChild(wall);

    return [leftWall, rightWall];
}

   

function splitOnRoomBoundaries(walls, floors, callback) {
    let pendingWalls = [];
    let loadedWalls = 0;

    walls.forEach(wall => {
        calcWallWorld(wall);
        const newWalls = splitWallIfNeeded(wall, floors);
        if(newWalls != null) {
            pendingWalls.push.apply(pendingWalls, newWalls);
        }
    });

    if(pendingWalls.length === 0) {
        callback();
        return;
    }
    
    pendingWalls.forEach(wall => {
        wall.addEventListener('loaded', () => {
            loadedWalls++;
            if(loadedWalls === pendingWalls.length) {
                setTimeout(() => {
                    splitOnRoomBoundaries(pendingWalls, floors, callback);
                },1000);
                
            }
        });
    });
}

function getAdjacencyCheckRay(wall, front) {
    const mid = planar.midpoint.apply(null, front ? wall.backWorld : wall.frontWorld);

    const norm = new THREE.Vector3(0, 0, front ? 1 : -1)
    .applyMatrix4(wall.mat)
    .normalize();

    const normPlanar = toPlanar(norm).normalize();

    // mid.add(normPlanar.clone().multiplyScalar(5 * EPS));

    return [mid, normPlanar];
}

function getWallAdjacency(wall, floors, front) {
    const ray = getAdjacencyCheckRay(wall, front);
    const start = ray[0];

    for(let i=0; i<floors.length; ++i) {
        const floor = floors[i];
        if(planar.isInside(start, floor.polyWorld)) {
            return {
                type: floor.tag === 'exterior' ? 'exterior' : 'interior',
                floor: floor
            };
        }
    }

    let smallest = Number.MAX_VALUE;

    let intersectedFloor = null;
    for(let i=0; i<floors.length; ++i) {
        const floor = floors[i];
        const poly = floor.polyWorld;
        for(let j=1; j<poly.length; ++j) {
            const segment = [poly[j-1], poly[j]];
            const intersection = planar.raySegmentIntersection(ray, segment);
            if(intersection != null) {
                intersectedFloor = floor;
                const dist = start.distanceTo(intersection);
                if(dist < smallest) {
                    smallest = dist;
                }
            }
        }
    }

    if(intersectedFloor != null && smallest <= 0.1) {
        return {
            type: floor.tag === 'exterior' ? 'exterior' : 'interior',
            floor: intersectedFloor
        };
    }

    const dirs = [
        new THREE.Vector2(1, 0),
        new THREE.Vector2(-1, 0),
        new THREE.Vector2(0, 1),
        new THREE.Vector2(0, -1)
    ];

    // let smallest = Number.MAX_VALUE;

    const surrounded = dirs.every(dir => {

        let intersected = false;
        for(let i=0; i<floors.length; ++i) {
            const floor = floors[i];
            const poly = floor.polyWorld;
            for(let j=1; j<poly.length; ++j) {
                const segment = [poly[j-1], poly[j]]
                const intersection = planar.raySegmentIntersection([start, dir], segment);
                if(intersection != null) {
                    intersected = true;
                    const dist = start.distanceTo(intersection);
                    if(dist < smallest) {
                        smallest = dist;
                    }
                }
            };
        }
        
        return intersected;
    });

    if(surrounded && smallest < 0.5) {
        return {
            type: 'hidden'
        };
    }

    return {
        type: 'exterior'
    };
}

function setAdjacentFloors(walls, floors) {
    walls.forEach(wall => {
        const front = getWallAdjacency(wall, floors, true);
        const back = getWallAdjacency(wall, floors, false);

        // console.log(front);

        wall.frontInfo = front;
        wall.backInfo = back;

        if(wall.frontInfo.type !== wall.backInfo.type) {
            // Mirror materials for wall with only one face hidden
            // (because they might extend to the sides and thus become not really hidden)
            if(wall.frontInfo.type === 'hidden') {
                wall.frontInfo = wall.backInfo;
            } else if(wall.backInfo.type === 'hidden') {
                wall.backInfo = wall.frontInfo;
            }
        }
    });
}

export function processWalls(callback) {

    const level = document.querySelector('.io3d-level');

    const walls = Array.from(level.querySelectorAll('[io3d-wall]'));

    const floors = Array.from(level.querySelectorAll('[io3d-polyfloor]'));

    floors.forEach(f => calcFloorWorld(f));

    splitOnRoomBoundaries(walls, floors, () => {
        const walls = Array.from(level.querySelectorAll('[io3d-wall]'));
        setAdjacentFloors(walls, floors);
        callback();
    });
}