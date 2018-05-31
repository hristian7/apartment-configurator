import * as mat from '../materials';
import * as furniture from '../furniture';

const handlers = {
    interior_wall: (action) => mat.changeWallsWithFloorTag('general', action),
    bathroom_wall: (action) => mat.changeWallsWithFloorTag('bathroom', action),
    exterior_wall: (action) => mat.changeWallsWithType('exterior', action),
    floor: (action) => mat.changeFloorsByTag('general', action),
    bathroom_floor: (action) => mat.changeFloorsByTag('bathroom', action),
    kitchen: (action) => mat.changeKitchens(action),
    furniture_style: (action) => furniture.changeStyle(action),
};

function handleGroupSelect(group, actionId) {
    Array.from(group.children).forEach(child => {
        if(child.id === actionId) {
            child.classList.add('selected');
        } else {
            child.classList.remove('selected');
        }
    });

    if(handlers[group.id] !== undefined) {
        handlers[group.id](actionId);
    }
}

export function init() {

    const menu = document.querySelector('.menu');

    const dropdowns = document.querySelectorAll('.dropdown');

    let activeDropdown = null;
    dropdowns.forEach(dropdown => {
        dropdown.label = dropdown.querySelector('.dropdown-label');
        dropdown.icon = dropdown.querySelector('.dropdown-toggle');
        dropdown.content = dropdown.querySelector('.dropdown-content');

        dropdown.open = () => {
            dropdown.icon.classList.add('open');
            dropdown.content.classList.add('open');
        };

        dropdown.close = () => {
            dropdown.icon.classList.remove('open');
            dropdown.content.classList.remove('open');
        };
        
        dropdown.label.addEventListener('click', () => {
            if(activeDropdown === dropdown) {
                dropdown.close();
                activeDropdown = null;
            } else {

                dropdown.open();
                if(activeDropdown != null) {
                    activeDropdown.close();
                }
                activeDropdown = dropdown;

                
                
            }
        });
    });

    const imageGroups = document.querySelectorAll('.image-group');
    imageGroups.forEach(group => {
        Array.from(group.children).forEach(child => {
            const id = child.id;
            const image = child.querySelector('.option-image');
            image.addEventListener('click', () => {
                handleGroupSelect(group, id);
            });
        });
    });

    const scene = document.querySelector('a-scene');
    // let transitioning = false;
    // function update() {
    //     scene.resize();

    //     if(transitioning) {
    //         requestAnimationFrame(update);
    //     }
    // }

    menu.addEventListener('transitionend', () => {
        // transitioning = false;
        scene.resize();
    });

    let menuOpen = true;
    const toggleButton = document.querySelector('#menu_toggle');
    toggleButton.addEventListener('click', () => {
        menuOpen = !menuOpen;

        if(menuOpen) {
            toggleButton.classList.remove('menu-toggle-closed');
            toggleButton.classList.add('menu-toggle-open');

            menu.classList.remove('menu-closed');

        } else {
            toggleButton.classList.remove('menu-toggle-open');
            toggleButton.classList.add('menu-toggle-closed');

            menu.classList.add('menu-closed');
        }

        // transitioning = true;
        // requestAnimationFrame(update);
    });
}