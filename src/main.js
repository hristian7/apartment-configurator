/* global io3d */

import * as switchUI from "./ui/scene-switch";
import * as cameraUI from "./camera";
import * as menu from "./ui/menu";
import * as controlButtons from "./ui/control-buttons";
import * as logo from './interactions/logo';
import * as util from "./utils";
import {elementClick} from "./interactions/element-click";
import * as constants from "./constants";

import * as room from './room';

const defaultScene = 'babed27c-1573-44c9-8a93-9b4fe3745466';
const sceneContent = document.querySelector('#scene-content');
const loader = document.querySelector('#loader');
const camera = document.querySelector('#camera');
let ioScene;


//empactreality.com
/*io3d.config({
    publishableApiKey: 'cc42bce0-737d-421c-8a4c-506ec09f6d24'
})*/

// original empactreality.com
/*io3d.config({
    publishableApiKey: 'fb35af59-540b-4086-8363-6e4d9c59e218'
})*/

//localhost
/*io3d.config({
    publishableApiKey: 'fb35af59-540b-4086-8363-6e4d9c59e218'
})*/

//local ip OFFICE
/*
io3d.config({
    publishableApiKey: '9bdd49e3-fb43-4ef1-b622-5b65c2cff10f'
})
*/

/*io3d.config({
    publishableApiKey: 'a3adc88b-aac9-4cc5-be45-afa205af34d5'
})*/

//http://webvr.empactreality.com
/*io3d.config({
    publishableApiKey: 'cc5fa258-7162-4c7c-834f-ea34e2c0952c'
})*/

//192.168.1.225
// io3d.config({
//     publishableApiKey:'53cbcaf7-67d2-44c7-86d0-32b80c64601b'
// })

//webvr.empactreality.com
io3d.config({
    publishableApiKey: '06721e12-a94a-4caf-8b72-e08b4482f302'
});

//ivo localhost
// io3d.config({
//     publishableApiKey: '5de31621-f5f1-4d56-8014-e2009674bd47'
// });

//ivo home mac mz
// io3d.config({
//     publishableApiKey: '3799cdcb-c51f-4268-8540-a7cc9dcfccb2'
// });


if(window.location.hash === '') {
    window.location.hash = defaultScene;
}
window.addEventListener('hashchange', () => {
    window.location.reload();
});

// scene content
let hash = window.location.hash
hash = hash.substr(1);
//alert('window hash: ' + hash);
//let sceneStructure = io3d.scene.getSceneStructureFromAframeElements(roomEl)

function onModelsFullyLoaded() {

    room.fixExportSchema();
    room.processWalls(() => {
        // constants.cursorEl.components['raycaster'].refreshObjects();
        // constants.cursorEl.addEventListener('mousedown', (e) => {
        //     // console.log('CURSOR CLICK')
        //     // console.log(e.detail.intersectedEl)
        //     e.preventDefault();
        //     elementClick(e.detail.intersectedEl, e.detail.intersection.point)
        // });

        loader.classList.add('loader-hide');
        loader.addEventListener('transitionend', () => {
            loader.style.display = 'none';
        });
    });
}

io3d.scene.getStructure(hash).then(structure => {
    unbakeScene(structure);
    return io3d.scene.getAframeElementsFromSceneStructure(structure);
}).then(elements => {
    //const ioScene = _.find(elements, e => e.className === "io3d-scene");
    ioScene = elements[0];
    // console.log(ioScene);
    sceneContent.appendChild(ioScene);

    ioScene.addEventListener('loaded', () => {

        let furnitureTotal = 0;
        let furnitureLoaded = 0;

        util.iterateAframeComponents(ioScene, (ele) => {
            if(ele.hasAttribute('io3d-wall')
                || ele.hasAttribute('io3d-furniture')
                || ele.hasAttribute('io3d-polyfloor')
                || ele.hasAttribute('io3d-kitchen')
                || ele.hasAttribute('io3d-pic')
                || ele.hasAttribute('io3d-interior')) {
                // ele.classList.add('clickable');
                util.enableShadows(ele);
            }

            if(ele.hasAttribute('io3d-polyfloor')) {
                const floor = ele.getAttribute('io3d-polyfloor');
                let tag;
                if(floor.hasCeiling === false) {
                    tag = 'exterior';
                } else if(floor.usage === 'bathroom') {
                    tag = 'bathroom';
                } else {
                    tag = 'general';
                }
                ele.tag = tag;
                ele.setAttribute('io3d-polyfloor', 'hasCeiling', false);
            }
            if(ele.hasAttribute('io3d-window')) {
                ele.setAttribute('io3d-window', 'hideGlass', true);
            }
            if(ele.hasAttribute('io3d-kitchen')) {
                // console.log(ele.getAttribute('io3d-kitchen'));
                ele.setAttribute('io3d-kitchen', 'material_counter', 'counter_granite_black');
            }

            if(ele.hasAttribute('io3d-furniture')) {
                furnitureTotal++;
                ele.addEventListener('model-loaded', function listener() {
                    ele.removeEventListener('model-loaded', listener);
                    furnitureLoaded++;
                    if(furnitureLoaded === furnitureTotal) {
                        onModelsFullyLoaded();
                    }
                });
            }
        });

        if(furnitureTotal === 0) {
            onModelsFullyLoaded();
        }

        cameraUI.init();
        switchUI.init();
        menu.init();
        controlButtons.init();
    });
});

function iterateScene(structure, func) {
    const stack = [structure];
    while(stack.length > 0) {
        const top = stack.pop();
        func(top);
        if(top.children instanceof Array) {
            stack.push.apply(stack, top.children);
        }
    }
}

function unbakeScene(structure) {
    iterateScene(structure, ele => {
        delete ele.bake;
        delete ele.bakedModelUrl;
        delete ele.bakePreviewStatusFileKey;

        // if(ele.type === 'level') {
        //     ele.type = "group";
        // }
    });
}