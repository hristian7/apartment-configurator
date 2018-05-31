export const cursorEl = document.querySelector('#cursor');

export const idBlackList = {
        '5a89675e-cd66-4d84-a455-a9c1f15a6495': 'adc5034d-8007-4bac-bb18-65f6799a31d9', // drop chairs in different colors
        '0e524f65-8e52-4ce2-9055-2bdaa3504503': 'adc5034d-8007-4bac-bb18-65f6799a31d9', // replace with grand prix
        '097f03fe-1947-40ee-a176-45106c51460f': '9e4def76-8cb1-4ee0-8ead-a4f1213e1082',
        '9d78888d-72df-4762-afec-8334da5e2396': '9e4def76-8cb1-4ee0-8ead-a4f1213e1082',
        'c4af7f4e-cd4d-45f5-8b31-1aaa903d539e': '9e4def76-8cb1-4ee0-8ead-a4f1213e1082',
        '06de72ae-ceaf-4c5e-8375-04e37f26db91': 'ec546718-d5a8-4e0d-889f-3d51dc37c2e1', // fat fat replace with hay cube
        '0ce9a52a-ca29-4639-a7db-4c6a2622b937': 'fa35827f-b18f-48bc-bb2c-6a458d1cebba', // floor standing lamps
        'bdab30be-5a7b-487e-ad0c-e199909aa9be': 'fa35827f-b18f-48bc-bb2c-6a458d1cebba',
        'b7fa1695-06f8-4fc5-b6d0-3f986137b9a2': 'fa35827f-b18f-48bc-bb2c-6a458d1cebba'
    }

export const styles = [
    'nordic',
    'urban industrial',
    'minimal'
]

// attributes for 'random' room generation
export const floorAttr = {
    material_top: [
        'wood_parquet_oak',
        'wood_parquet_oak_stained',
        'wood_parquet_oak_dark',
        'parquet_heringbone_oak',
        'black_white_tiles',
        'tiles-dark-large'
    ]
}
export const doorAttr = {
    doorAngle: [25, 60, 100],
    hinge: ['left', 'right'],
    doorType: ['singleSwing', 'slidingDoor']
}
export const picAttr = {
    picType: ['poster', 'framed', 'canvas'],
    picFormat: ['portrait', 'panorama']
}
export const wallSetups = [
    [
        {type: 'window', x: 1.6, l: 2.4, h: 2, y: 0.2, hideGlass:true}
    ],
    [
        {type: 'window', x: 0.3, l: 2.2, h: 1.4, y: 0.8, hideGlass:true},
        {type: 'door', x: 3, l: 0.9, h: 2.2, side: 'front'},
    ], [
        {type: 'door', x: 1, l: 0.9, h: 2.2, side: 'front'},
        {type: 'window', x: 2.5, l: 1.4, h: 1.3, y: 0.8, hideGlass:true}
    ], [
        {type: 'window', x: 0.5, l: 1, h: 2.3, y: 0.1, hideGlass:true},
        {type: 'window', x: 1.7, l: 1, h: 2.3, y: 0.1, hideGlass:true},
        {type: 'window', x: 2.9, l: 1, h: 2.3, y: 0.1, hideGlass:true}
    ]
]
export const windowAttr = {
    side: ['front', 'center', 'back'],
    rowRatios: [[1], [1,2], [1, 1]],
    columnRatios: [[[1]], [[1], [1, 3]], [[1, 4, 1]], [[1, 1], [1, 1]]]
}
export const wallAttr = {
    material_front: [
        'default_plaster_001',
        'bricks_yellow',
        //'zigzag',
        'bricks_white',
        // 'concrete_board',
        // 'memphis_pattern',
        'cabinet_wood_fir_wall'
    ],
    material_back: [
        'default_plaster_001',
        'bricks_yellow',
        //'zigzag',
        'bricks_white',
        // 'concrete_board',
        // 'memphis_pattern',
        'cabinet_wood_fir_wall'
    ]
}
export const kitchenAttr = {
    wallCabinet: [false, true],
    highCabinetLeft: [0, 1, 2],
    cabinetType: ['none', 'style1', 'style2'],
    material_kitchen: ['cabinet_paint_creme', 'cabinet_paint_grey', 'cabinet_paint_brick', 'cabinet_paint_anthrazit'],
    //l: [4.2, 3.6]
}

export const EPS = 0.001;