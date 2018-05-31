/* global THREE */

import {EPS} from '../constants';

export function perp(vec) {
    return new THREE.Vector2(vec.y, -vec.x);
}

export function areaProduct(v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
}

export function midpoint(v1, v2) {
    return v1.clone().add(v2).multiplyScalar(0.5);
}

export function segmentIntersectionInside(l1, l2) {
    // Get rays
    const start1 = l1[0];
    const dir1 = l1[1].clone().sub(l1[0]);

    const start2 = l2[0];
    const dir2 = l2[1].clone().sub(l2[0]);

    const dirDifference = areaProduct(dir1, dir2);
    if(dirDifference === 0) { 
        //Technically, they can be collinear, but we don't care about that for our use cases
        return null;
    }

    const l2StartProjected = start2.clone().sub(start1);

    const l1IntersectionCoef = areaProduct(l2StartProjected, dir2) / dirDifference;
    const l2IntersectionCoef = areaProduct(l2StartProjected, dir1) / dirDifference;

    const EPS1 = EPS * dir1.length();
    const EPS2 = EPS * dir2.length();

    // We don't want intersections directly on the edge either
    if(l1IntersectionCoef > EPS1 && l1IntersectionCoef < 1 - EPS1
        && l2IntersectionCoef > -EPS2 && l2IntersectionCoef < 1 + EPS2) {
        return start1.clone().add(dir1.multiplyScalar(l1IntersectionCoef));
    }
}

export function raySegmentIntersection(ray, segment) {
    const start1 = ray[0];
    const dir1 = ray[1];

    const start2 = segment[0];
    const dir2 = segment[1].clone().sub(segment[0]);

    const dirDifference = areaProduct(dir1, dir2);
    if(dirDifference === 0) { 
        //Technically, they can be collinear, but we don't care about that for our use cases
        return null;
    }

    const segmentStartProjected = start2.clone().sub(start1);

    const rayIntersectionCoef = areaProduct(segmentStartProjected, dir2) / dirDifference;
    const segmentIntersectionCoef = areaProduct(segmentStartProjected, dir1) / dirDifference;

    const EPS1 = EPS * dir1.length();
    const EPS2 = EPS * dir2.length();

    // We don't want intersections directly on the edge either
    if(rayIntersectionCoef > EPS1
        && segmentIntersectionCoef > -EPS2 && segmentIntersectionCoef < 1 + EPS2) {
        return start1.clone().add(dir1.multiplyScalar(rayIntersectionCoef));
    }
}

export function isInside(point, poly) {
    const x = point.x;
    const y = point.y;

    // Since the direction we travel to is arbitrary, we can choose it to be horizontal for optimisation purposes
    // Then whether we intersect a segment with a ray or not is down to checking y axis order, for the most part

    let inside = false;

    for(let i=1; i<poly.length; ++i) {
        let x1 = poly[i-1].x;
        let y1 = poly[i-1].y;
        let x2 = poly[i].x;
        let y2 = poly[i].y;

        if(y1 > y2) {
            const ty = y1;
            y1 = y2;
            y2 = ty;
        }

        // Normally criss-crossing the points might be bad, but for the way we use x coordinates we don't care
        if(x1 > x2) {
            const tx = x1;
            x1 = x2;
            x2 = tx;
        }

        if(Math.abs(x - x1) < EPS && Math.abs(x-x2) < EPS) {
            if(y > y1 - EPS && y < y2 + EPS) {
                return true;
            }
        }

        if(Math.abs(y - y1) < EPS) {

            if(Math.abs(y - y2) < EPS) { 
                // Collinear, check if we're on it or not
                if(x > x1 - EPS && x < x2 + EPS) {
                    return true; // We'll count being on a boundary as inside
                }
                // Otherwise, we'll go into and out of a boundary segment, so no parity change
            }

            inside = !inside; 
            // We'll deliberately not check for being on y2, so we don't flip parity twice accidentally
            // (once more from the adjacent segment)
        } else if(y > y1 - EPS && y < y2 + EPS) {
            // We'll cross this eventually, don't care when.
            inside = !inside;
        }

    }


    return inside;
}