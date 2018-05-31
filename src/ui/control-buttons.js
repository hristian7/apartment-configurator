import {setWallTransparency} from '../materials';

export function init() {

    const wallButton = document.querySelector('#control-wall-opacity');
    let wallsTransparent = false;
    wallButton.addEventListener('click', () => {
        wallsTransparent = !wallsTransparent;

        if(wallsTransparent) {
            setWallTransparency(0.6);
        } else {
            setWallTransparency(1);
        }
    });
}