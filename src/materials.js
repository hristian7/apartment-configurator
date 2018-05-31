const scene = document.querySelector('a-scene');


export function changeFloorsByTag(tag, newMaterial) {
    const floors = Array.from(scene.querySelectorAll('[io3d-polyfloor]'))
    .filter(f => f.tag === tag);
    
    floors.forEach(f => {
        f.setAttribute('io3d-polyfloor', 'material_top', newMaterial);
    });
}

export function changeKitchens(newMaterial) {
    const kitchens = Array.from(scene.querySelectorAll('[io3d-kitchen]'));
    
    kitchens.forEach(f => {
        f.setAttribute('io3d-kitchen', 'material_kitchen', newMaterial);
    });
}

function updateWallMaterial(wall, kind, value) {
    if(wall.transparent) {
        wall['backup_' + kind] = value;
    } else {
        wall.setAttribute('io3d-wall', 'material_'+kind, value)
    }
}

export function changeWallsWithFloorTag(tag, newMaterial) {
    const walls = Array.from(scene.querySelectorAll('[io3d-wall]'));

    walls.forEach(wall => {
        if(wall.frontInfo.floor != null && wall.frontInfo.floor.tag === tag) {
            updateWallMaterial(wall, 'front', newMaterial);
        }

        if(wall.backInfo.floor != null && wall.backInfo.floor.tag === tag) {
            updateWallMaterial(wall, 'back', newMaterial);
        }
    });
}

export function changeWallsWithType(type, newMaterial) {
    const walls = Array.from(scene.querySelectorAll('[io3d-wall]'));

    walls.forEach(wall => {
        if(wall.frontInfo.type === type) {
            updateWallMaterial(wall, 'front', newMaterial);
        }

        if(wall.backInfo.type === type) {
            updateWallMaterial(wall, 'back', newMaterial);
        }
    });
}


export function setWallTransparency(value) {
    const walls = Array.from(scene.querySelectorAll('[io3d-wall]'));
    // console.log(walls[0]);
    walls.forEach(wall => {
        if(value < 1) {
            const info = wall.getAttribute('io3d-wall');
            wall.backup_front = info.material_front || "basic-wall";
            wall.backup_back = info.material_back || "basic-wall";
            wall.transparent = true;
            wall.setAttribute('io3d-wall', 'material_front', 'glass-wall');
            wall.setAttribute('io3d-wall', 'material_back', 'glass-wall');   
        } else {
            wall.transparent = false;
            wall.setAttribute('io3d-wall', 'material_front', wall.backup_front);
            wall.setAttribute('io3d-wall', 'material_back', wall.backup_back);   
        }
    });
}

function walkObjects(object3D, f) {
    const stack = [object3D];
    while(stack.length > 0) {
        const o = stack.pop();
        f(o);
        if(o.children instanceof Array) {
            stack.push.apply(stack, o.children);
        }
    }
}