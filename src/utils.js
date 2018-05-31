/* global THREE */

import * as constants from "./constants";

export function iterateAframeComponents(root, func) {
    const stack = [root];
    while(stack.length > 0) {
        const curr = stack.pop();
        func(curr);
        if(typeof curr.getChildEntities === "function") {
            stack.push.apply(stack, curr.getChildEntities());
        }
    }
}

export function ordinal(n) {
    let suffix;
    if(n >= 11 && n < 20) {
        suffix = 'th';
    } else if(n%10 === 1) {
        suffix = 'st';
    } else if(n%10 === 2) {
        suffix = 'nd';
    } else if(n%10 === 3) {
        suffix = 'rd';
    } else {
        suffix = 'th';
    }

    return `${n}${suffix}`;
}

// pick random attributes
export function rndAttr(original, att, frontface) {
    let _att = {};
    Object.keys(att).forEach(a => {
        if (a === 'rowRatios' || a === 'columnRatios') {
            _att[a] = JSON.stringify(pickRnd(att[a]));
            console.log('[_att[a]] if: ' + _att[a]);
        } else if (a === 'material_front' || a === 'material_side' || a === 'material_back') {
            if (frontface) {
                _att['material_front'] = pickRnd(att['material_front']);
            } else {
                _att['material_back'] = pickRnd(att['material_back']);
            }
        } else {
            _att[a] = pickRnd(att[a]);
        }
    });
    
    let allMatch = true;
    for(let key in _att) {
        if(original[key] != _att[key]) {
            allMatch = false;
            break;
        }
    }

    if(allMatch) {
        return rndAttr(original, att, frontface);
    }

    return _att;
}

// pick random array item
function pickRnd(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

export

// adapt 3d scene with random attributes
function setRndAttributes () {
    // update wall children
    let wallElements = io3d.scene.getAframeElementsFromSceneStructure(wallSetup);
    while (wallEl.firstChild) {
        wallEl.removeChild(wallEl.firstChild)
    }
    wallElements.forEach(el => {
        wallEl.appendChild(el)
    })

    // get new attributes
    let newFloorAttr = rndAttr(constants.floorAttr);
    let newDoorAttr = rndAttr(constants.doorAttr);
    let newWindowAttr = rndAttr(constants.windowAttr);
    let newWallAttr = rndAttr(constants.wallAttr);
    newDoorAttr['material_threshold'] = newFloorAttr['material_top'];

    // apply attributes
    let floorEls = document.querySelectorAll('[io3d-polyfloor]');
    floorEls.forEach(el => el.setAttribute('io3d-polyfloor', newWallAttr));

    kitchenEl.setAttribute('io3d-kitchen', rndAttr(constants.kitchenAttr));
    doorEl = document.querySelector('[io3d-door]');
    if (doorEl) doorEl.setAttribute('io3d-door', newDoorAttr);

    let wallEls = document.querySelectorAll('[io3d-wall]');
    wallEls.forEach(el => el.setAttribute('io3d-wall', newWallAttr));

    let windowEls = document.querySelectorAll('[io3d-window]');
    windowEls.forEach(el => el.setAttribute('io3d-window', newWindowAttr));

    // set background and font
    let skyHue = Math.floor(Math.random() * 18) * 20;
    let fontHue = skyHue + 180 > 360 ? skyHue + 180 - 360 : skyHue + 180;
    document.querySelector('body').style.background = `hsl(${skyHue}, 50%, 80%)`
}

export function findCommonElements(haystack, arr) {
    console.log(haystack);
    console.log(arr);
    return arr.some(function (v) {
        return haystack.indexOf(v) >= 0;
    });

    /*console.log(haystack);
    console.log(arr);*/

    /*for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < haystack.length; j++) {
            if (haystack[j] == arr[i]) {
                console.log('is same type element')
                return true
            }
        }
    }

    return false;*/
}

export function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getWorldTransform(obj) {
    const worldSpace = new THREE.Matrix4();
    while (obj != null && obj.object3D != null) {
        worldSpace.premultiply(obj.object3D.matrix);
        obj = obj.parentElement;
    }
}

export function getMaterialByName(name) {
    return {
        
    }[name];
}

export function deepClone(obj) {
    if(obj instanceof Array) {
        return obj.map(deepClone);
    } else if(typeof obj === "object") {
        const res = {};
        for(let key in obj) {
            if(obj.hasOwnProperty(key)) {
                res[key] = deepClone(obj[key]);
            }
        }
        return res;
    } else {
        return obj;
    }
}

export function enableShadows(ele) {
    ele.setAttribute('shadow', 'cast: true; receive: true');
}

export function positionVectorFromCameraRotation(rotation) {
    const downAngle = deg2rad(rotation.x) + Math.PI/2;
    const horizontalAngle = deg2rad(rotation.y);

    const y =  Math.cos(downAngle);
    const groundLength = Math.sin(downAngle);
    const x = groundLength * Math.cos(horizontalAngle);
    const z = groundLength * Math.sin(horizontalAngle);

    return new THREE.Vector3(x,y,z);
}

export function deg2rad(deg) {
    return deg * Math.PI / 180;
}

export function zoomToFit(camera, rotation, object, offset) {
    offset = offset || 1.2;

    const bounds = new THREE.Box3();
    bounds.setFromObject(object.object3D);

    const rotationEuler = new THREE.Euler(deg2rad(rotation.x), deg2rad(rotation.y), deg2rad(rotation.z));

    const cameraMatrix = new THREE.Matrix4().makeRotationFromEuler(rotationEuler);
    cameraMatrix.getInverse(cameraMatrix);

    bounds.applyMatrix4(cameraMatrix);

    const size = bounds.getSize();

    const center = bounds.getCenter();
    center.y = 0;

    const info = camera.getAttribute("camera");
    const maxDim = Math.max( size.x, size.y, size.z );
    const fov = deg2rad(info.fov);

    let cameraDist = maxDim / 2 / Math.tan(fov/2);    

    cameraDist *= offset;


    return {
        center: center,
        distance: cameraDist,
    };
}