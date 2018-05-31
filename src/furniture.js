/* global io3d*/

import {findCommonElements, randomElement} from './utils';

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

function replaceElement(el, style) {
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

    io3d.staging.getFurnitureAlternatives(el.getAttribute('io3d-furniture').id, {query: style})
    .then(result => {
        if (!result || result.length === 0) {
            // console.log("NO RESULT!");
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
            // console.log("TOO SIMILAR");
            // console.log(el.getAttribute('io3d-furniture'));
            replaceElement(el, style);
            return;
        }

        const pos = getNewPosition(el, offset);
        el.setAttribute('position', pos);

        el.setAttribute('io3d-furniture', `id: ${furniture.id}`);
        el.addEventListener('model-loaded', function listener() {
            el.removeEventListener('model-loaded', listener);
            isProcessing = false;
        });
    })
    .catch(error => {
        console.error(error);
        isProcessing = false;
    });
}

export function changeStyle(style) {
    // if(isProcessing) {
    //     return;
    // }

    // isProcessing = true;

    const elements = document.querySelectorAll('[io3d-furniture]');
    elements.forEach(el => replaceElement(el, style));
    
}