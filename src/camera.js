/* global AFRAME */

import * as util from './utils';

const camera = document.querySelector('#camera');
const rotateButton = document.querySelector('#control-rotate');
const perspectiveButton = document.querySelector('#control-perspective');

let isRotating = false;
let room = document.querySelector('#scene-content');

const canvasEl = document.querySelector('canvas');
let minZoom = 0.5;
let maxZoom = 5;
//let zoomStep = 0.0005;
let zoomStep = 1.04;

let zoom = 1;

let prevDiff = -1;

const rotationPerspective = {
    x: -60,
    y: 45,
    z: 0
};
const rotationTopDown = {
    x: -89, // No gimbal lock pls
    y: 45,
    z: 0
};

let distancePerspective;
let distanceTopDown;

let cameraMode = "perspective";

let cameraCenter;
let cameraDistance;
let cameraOffsetVector;

function updateCamera() {
    const rotation = cameraMode==="perspective" ? rotationPerspective : rotationTopDown;
    camera.setAttribute("rotation", rotation);

    cameraOffsetVector = util.positionVectorFromCameraRotation(rotation);
    cameraDistance = cameraMode==="perspective" ? distancePerspective : distanceTopDown;

    const newPosition = cameraOffsetVector.clone()
    .multiplyScalar(zoom * cameraDistance)
    .add(cameraCenter);

    camera.setAttribute('position', newPosition);
}

export function init() {
    const fitInfo = util.zoomToFit(camera, rotationPerspective, room);
    const fitInfoTopDown = util.zoomToFit(camera, rotationTopDown, room);
    cameraCenter = fitInfo.center;
    distancePerspective = fitInfo.distance;
    distanceTopDown = fitInfoTopDown.distance;

    updateCamera();


    rotateButton.addEventListener('click', () => {
        if (room === null) {
            room = document.querySelector('.io3d-scene');
        }

        console.log(room + ' ');

        if (!isRotating) {
            let currentRotation = room.getAttribute('rotation');
            let yRotation = parseInt(currentRotation['y']);
            if (yRotation % 90 == 0) {
                yRotation += 90;
            } else {
                let prevValue = yRotation - (yRotation % 90);
                yRotation = prevValue + 90;

                if (yRotation == parseInt(currentRotation['y'])) {
                    yRotation = yRotation + 90;
                }
            }

            let newRotationValue = String(currentRotation['x']) + ' '
                + String(yRotation) + ' ' + String(currentRotation['z']);

            let animationValuesStr = 'property: rotation; dur: 1500; to: ' + newRotationValue + '; startEvents:start;\n' +
                'restartEvents:turn; easing: easeInOutQuad';
            room.setAttribute('animation', animationValuesStr);

            isRotating = true;
            room.emit('start');

            setTimeout(() => {
                isRotating = false;
            }, 1505)
        }
    });

    if(AFRAME.utils.device.isMobile()) {
        //Events for mobile
        canvasEl.ontouchmove = pointermove_handler;

        //Events for desktop
        canvasEl.addEventListener('scroll', onMouseWheel, false);
        canvasEl.addEventListener('MozMousePixelScroll', onMouseWheel, false); // firefox    
    } else {
        canvasEl.addEventListener('mousewheel', onMouseWheel, false);
        canvasEl.addEventListener('MozMousePixelScroll', onMouseWheel, false); // firefox    
    }

    perspectiveButton.addEventListener('click', () => {
        cameraMode = (cameraMode === "perspective") ? "topDown" : "perspective";
        updateCamera();
    });
}

function pointermove_handler(ev) {
    ev.preventDefault();
    ev.stopImmediatePropagation();
    console.log('POINTER MOVE HANDLER')
    if (ev.targetTouches.length == 2 && ev.changedTouches.length == 2) {
        // Calculate the distance between the two pointers
        var curDiff = Math.abs(ev.targetTouches[0].clientX - ev.targetTouches[1].clientX);

        if (prevDiff > 0) {
            if (curDiff > prevDiff) {
                console.log("Pinch moving OUT -> Zoom in", ev);
                zoom = calcNewZoomLevel(true);
                updateCamera();
            }
            if (curDiff < prevDiff) {
                console.log("Pinch moving IN -> Zoom out", ev);
                zoom = calcNewZoomLevel(false);
                updateCamera();
            }
        }
        // Cache the distance for the next move event
        prevDiff = curDiff;
    }
}

function onMouseWheel (event) {
    event.preventDefault();
    event.stopPropagation();
    handleMouseWheel(event);
}

function handleMouseWheel(event) {
    var delta = 0;
    if (event.wheelDelta !== undefined) {
        // WebKit / Opera / Explorer 9
        delta = event.wheelDelta;
    } else if (event.detail !== undefined) {
        // Firefox
        delta = -event.detail;
    }

    if (delta > 0) {
        console.log("Pinch moving IN -> Zoom out", event);
        zoom = calcNewZoomLevel(true);
        updateCamera();
    } else if (delta < 0) {
        console.log("Pinch moving IN -> Zoom out", event);
        zoom = calcNewZoomLevel(false);
        updateCamera();
    }
}

function getCurrentZoomLevel() {
    return zoom;
}

function calcNewZoomLevel(isZoomIn) {
    let currentZoom = getCurrentZoomLevel();
    if (isZoomIn) {
        currentZoom *= zoomStep;
    } else {
        currentZoom /= zoomStep;
    }

    if (currentZoom < minZoom) {
        currentZoom = minZoom;
    }

    if (currentZoom > maxZoom) {
        currentZoom = maxZoom;
    }
    return currentZoom;
}