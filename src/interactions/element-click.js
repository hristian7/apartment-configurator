/*global THREE io3d*/

import {
    findCommonElements,
    rndAttr,
    randomElement
} from "../utils";
import * as constants from "../constants";

let isProcessing = false;

function getNewPosition(ele, offset) {

    const rot = ele.getAttribute('rotation');
    const pos = ele.getAttribute('position');
    var s = Math.sin(rot.y / 180 * Math.PI);
    var c = Math.cos(rot.y / 180 * Math.PI);
    var newPosition = {
        x: pos.x + offset.x * c + offset.z * s,
        y: pos.y + offset.y,
        z: pos.z - offset.x * s + offset.z * c
    };
    return newPosition;
}

export function elementClick(el, point) {
    if (!el) return true;
    /*console.log(el);
    console.log(point);*/

    const isFurniture = el.getAttribute('io3d-furniture');
    const isWall = el.getAttribute('io3d-wall');
    const isFloor = el.getAttribute('io3d-polyfloor');
    const isKitchen = el.getAttribute('io3d-kitchen');
    const isPic = el.getAttribute('io3d-pic');

    // console.log({isProcessing: isProcessing});
    if (!isProcessing) {
        if (isFurniture && !isProcessing) {

            isProcessing = true;
            let isLamp = false;
            let components;

            if (el.hasOwnProperty('components')) {
                components = el.components;
                if (components.hasOwnProperty('io3d-furniture')) {
                    if (components['io3d-furniture'].info.categories[0] == 'lamps') {
                        isLamp = true;
                    }
                }
            }

            io3d.staging.getFurnitureAlternatives(el.getAttribute('io3d-furniture').id)
            .then(result => {
                if (!result || result.length === 0) {
                    console.log("NO RESULT!");
                    isProcessing = false;
                    return;
                }
                // console.log(randomElement(result));

                const {
                    furniture,
                    offset
                } = randomElement(result);


                const similar = findCommonElements(furniture.tags, el.components['io3d-furniture'].info.tags);
                if (isLamp && !similar) {
                    isProcessing = false;
                    console.log("TOO SIMILAR");
                    // console.log(el.getAttribute('io3d-furniture'));
                    elementClick(el, point);
                    return;
                }
 
                const pos = getNewPosition(el, offset);
                el.setAttribute('position', pos);

                el.setAttribute('io3d-furniture', `id: ${furniture.id}`);
                el.addEventListener('model-loaded', function listener() {
                    el.removeEventListener('model-loaded', listener);
                    // console.log("model-loaded");
                    setTimeout(() => {
                        constants.cursorEl.components['raycaster'].refreshObjects();
                        isProcessing = false;
                    }, 100);
                });
            })
            .catch(error => {
                console.error(error);
                isProcessing = false;
            });
        } else if (isWall) {
            console.log(el.getAttribute('io3d-wall'));

            let obj = el;
            const worldSpace = new THREE.Matrix4();
            while (obj != null && obj.object3D != null) {
                worldSpace.premultiply(obj.object3D.matrix);
                obj = obj.parentElement;
            }

            const objectSpace = new THREE.Matrix4();
            objectSpace.getInverse(worldSpace);

            const local = point
            .clone()
            .applyMatrix4(objectSpace);

            // console.log(local.z)
            const frontface = local.z < constants.EPS;
            // console.log(!frontface);

            let newAttr = rndAttr(el.getAttribute('io3d-wall'), constants.wallAttr, !frontface);
            //document.querySelectorAll('[io3d-wall]').forEach(el => el.setAttribute('io3d-wall', newAttr))
            el.setAttribute('io3d-wall', newAttr);
        } else if (isFloor) {
            // console.log('isFloor');
            let newAttr = rndAttr(el.getAttribute('io3d-polyfloor'), constants.floorAttr);
            el.setAttribute('io3d-polyfloor', newAttr)
        } else if (isPic) {
            // console.log('isPic');
            let newAttr = rndAttr(el.getAttribute('io3d-pic'), constants.picAttr);
            el.setAttribute('io3d-pic', newAttr).then(() => {
                constants.cursorEl.components['raycaster'].refreshObjects();
            });
        } else if (isKitchen) {
            // console.log('isKitchen');
            let newAttr = rndAttr(el.getAttribute('io3d-kitchen'), constants.kitchenAttr);

            isProcessing = true;
            el.addEventListener('mesh-updated', function listener() {
                el.removeEventListener('mesh-updated', listener);
                setTimeout(() => {
                    constants.cursorEl.components['raycaster'].refreshObjects();
                    isProcessing = false;
                }, 100);
            });

            el.setAttribute('io3d-kitchen', newAttr);
        } else {
            // console.log('isNothing');
            return true;
        }
    }
    constants.cursorEl.components['raycaster'].refreshObjects();
}