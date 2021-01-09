const X = 0, Y = 1, Z = 2, W = 3;
const R = 0, G = 1, B = 2, A = 3;

const { round, floor, ceil, abs, sign, sin, cos, tan, asin, acos, atan, atan2, sqrt, PI, log, log2, pow, exp, random, min, max } = Math;
const TAU = PI*2;
const SQRT2 = sqrt(2);
const SQRT3 = sqrt(3);


const saw = (n, m) => (n%m + m)%m;
const saw2 = ([nx, ny], [mx, my]) => [ (nx%mx + mx)%mx, (ny%my + my)%my ];
// const tri = (n, m) => (n%(m*2) + m)%m;

const add = (a, b) => [ a[X] + b[X], a[Y] + b[Y] ];
const sub = (a, b) => [ a[X] - b[X], a[Y] - b[Y] ];
const scl = (v, s) => [ v[X]*s, v[Y]*s ];
const len = ([ x, y ]) => sqrt(x*x + y*y);
const dst = (a, b) => sqrt((a[X] - b[X])**2 + (a[Y] - b[Y])**2);

const mul = (a, b) => [ a[X]*b[X], a[Y]*b[Y] ];
const div = (a, b) => [ a[X]/b[X], a[Y]/b[Y] ];

const lenSqr = ([ x, y ]) => x*x + y*y;
const dstSqr = (a, b) => (a[X] - b[X])**2 + (a[Y] - b[Y])**2;
const normalize = v => scl(v, 1/len(v));

const a2v = (a, r = 1) => [ cos(a)*r, sin(a)*r ];
const v2a = v => atan2(v[Y], v[X]);

const dot = (a, b) => a[X]*b[X] + a[Y]*b[Y];

const rot = (p, a) => [ p[X]*cos(a) - p[Y]*sin(a), p[Y]*cos(a) + p[X]*sin(a) ];


const add4 = (a, b) => [ a[X] + b[X], a[Y] + b[Y], a[Z] + b[Z], a[W] + b[W] ];
const sub4 = (a, b) => [ a[X] - b[X], a[Y] - b[Y], a[Z] - b[Z], a[W] - b[W] ];
const mul4 = (a, b) => [ a[X]*b[X], a[Y]*b[Y], a[Z]*b[Z], a[W]*b[W] ];
const div4 = (a, b) => [ a[X]/b[X], a[Y]/b[Y], a[Z]/b[Z], a[W]/b[W] ];

const dot4 = (a, b) => a[X]*b[X] + a[Y]*b[Y] + a[Z]*b[Z] + a[W]*b[W];
const scl4 = (v, s) => [ v[X]*s, v[Y]*s, v[Z]*s, v[W]*s ];

const transpose4x4 = ([ m0, m1, m2, m3 ]) => [
  [ m0[0], m1[0], m2[0], m3[0] ],
  [ m0[1], m1[1], m2[1], m3[1] ],
  [ m0[2], m1[2], m2[2], m3[2] ],
  [ m0[3], m1[3], m2[3], m3[3] ]
];

const v4m4x4 = (v, [ m0, m1, m2, m3 ]) => [ dot4(v,m0), dot4(v,m1), dot4(v,m2), dot4(v,m3) ];

const I4x4 = [
  [ 1, 0, 0, 0 ],
  [ 0, 1, 0, 0 ],
  [ 0, 0, 1, 0 ],
  [ 0, 0, 0, 1 ],
];



const SHAPES = {
  RECT: "RECT",
  CIRCLE: "CIRCLE",
  ARC: "ARC",
  POLYGON: "POLYGON",
  LINE: "LINE",
  PATH: "PATH"
};
const mkRect = (p, dim) => ({ type: SHAPES.RECT, p, dim });
const mkCircle = (p, r) => ({ type: SHAPES.CIRCLE, p, r });
const mkArc = (p, r, a0, a1) => ({ type: SHAPES.ARC, p, r, a0, a1 });
const mkPolygon = (p, ps) => ({ type: SHAPES.POLYGON, p, ps });
const mkLine = (p, p0, p1) => ({ type: SHAPES.LINE, p, p0, p1 });
const mkPath = (p, ps) => ({ type: SHAPES.PATH, p, ps });


const mkShape = ({ type, shape, p = [0,0], a = 0, dP = [ 0, 0] }) => {
  let d = sub(shape[1], shape[0]);
  // should point in
  let perp = normalize([ d[Y],-d[X] ]);

  let interrior = add(shape[0], scl(d, 0.5));
  interrior = add(interrior, scl(perp, 0.5));

  if (polygonContainsP([0, 0], 0, shape, interrior)) {
    // If the right hand perp does not point inwards, the winding must be
    // anti clockwise, and we should reverse the points
    shape.reverse();
    console.log("Reversing");
  } else {    
    console.log("Not Reversing");
  }


  return { type, shape, p, dP, a, active: true, statusEffects: [ [], [] ] };
};



// const mkRect = (p, dim, a = 0, scale = 1) => ({ p, dim, a, scale });


const rectContainsP = ({ dim, p }, point) => {
  let r = scl(dim, 0.5);
  point = sub(point, p);
  return -r[X] < point[X] && point[X] <= r[X]
      && -r[Y] < point[Y] && point[Y] <= r[Y];
};

const polygonContainsP = (shapeP, shapeA, vertices, p, r = 1) => {
  p = sub(p, shapeP);
  p = rot(p, -shapeA);
  if (r != 1) vertices = vertices.map(v => scl(v, r));

  let intersections = 0;
  for (let i = 0; i < vertices.length; ++i) {
    let a = vertices[saw(i, vertices.length)];
    let b = vertices[saw(i + 1, vertices.length)];

    if ((a[Y] <= p[Y] && b[Y] <= p[Y] )
      || (a[Y] >= p[Y] && b[Y] >= p[Y] )
      || (a[Y] == p[Y] && b[Y] == p[Y])) continue;

    if (p[X] < a[X] && p[X] < b[X]) intersections++;
    else {
      let d = sub(b, a);

      let dy = b[Y] - a[Y];
      let dyPrime = p[Y] - a[Y];
      let projected = add(a, scl(d, dyPrime/dy));
      if (p[X] < projected[X]) intersections++;
    }
  }

  return intersections%2;
};

const segSegIntersection = ([ a0, a1 ], [ b0, b1 ]) => {
  let dA = sub(a1, a0);
  let dB = sub(b1, b0);

  let dirA = normalize(dA);

  let dA0B0 = sub(b0, a0);

  let lenA0S = dot(dA, dA0B0)/len(dA);
  let s = add(a0, scl(dirA, lenA0S));
  let dB0S = sub(s, b0);

  let lenB0M = dot(dB0S, dB)/len(dB0S);

  let bT = len(dB0S)/lenB0M;
  let intersect = add(b0, scl(dB, bT));
  let dA0Intersect = sub(intersect, a0);
  let aT = len(dA0Intersect)/len(dA);
  
  aT *= sign(dot(dA, dA0Intersect));

  // ctx.beginPath();
  // ctx.arc(...s, 2, 0, TAU);
  // ctx.fill();
  // ctx.beginPath();
  // ctx.arc(...intersect, 2, 0, TAU);
  // ctx.fill();

  // ctx.beginPath();
  // ctx.moveTo(...a0);
  // ctx.lineTo(...a1);
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.moveTo(...b0);
  // ctx.lineTo(...s);
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.moveTo(...b0);
  // ctx.lineTo(...b1);
  // ctx.stroke();


  return [ intersect, aT, bT ];
};

const polygonSegIntersection = (shapeP, shapeA, vertices, seg, r = 1) => {
  seg = seg.map(p => sub(p, shapeP));
  seg = seg.map(p => rot(p, -shapeA));
  if (r != 1) vertices = vertices.map(v => scl(v, r));


  let intersectionP;
  let intersected;
  let smallestD = 1;
  let vt;
  
  for (let i = 0; i < vertices.length; ++i) {
    let v0 = vertices[i];
    let v1 = vertices[(i + 1)%vertices.length];
    let [ p, ds, dv ] = segSegIntersection(seg, [ v0, v1 ]);

    if (ds > 0 && dv > 0 && dv <= 1 && ds <= smallestD) {
      smallestD = ds;
      intersectionP = p;
      intersected = [ v0, v1 ];
      vt = dv;

    }
  }

  return [intersectionP, intersected, smallestD, vt];
};


const discSegIntersection = (p, r, seg) => {
  let d0 = dst(p, seg[0]), d1 = dst(p, seg[1]);
  if (false && d0 < r || d1 < r) {
    if (d0 < d1) {
      let delta = sub(seg[0], p);
      let intercept = add(p, scl(normalize(delta), r));
      return [ intercept, d0 - r ];
    } else {
      let delta = sub(seg[1], p);
      let intercept = add(p, scl(normalize(delta), r));
      return [ intercept, d1 - r ];
    }
  } else {
    let dseg = sub(seg[1], seg[0]);
    let segLen = len(dseg);
    let projectionD = dot(dseg, sub(p, seg[0]));
    let projectionP = add(seg[0], scl(dseg, projectionD/segLen/segLen));
    let obj2project = dst(projectionP, p);
  
    if (obj2project <= r) {
      let side = sqrt(r**2 - dst(p, projectionP)**2);
      let intercept = sub(projectionP, scl(dseg, side/segLen));
  
      let distance = dst(intercept, seg[0]);
      if (distance < segLen) return [ intercept, distance ];
    }
  }
};

const OFFSET8 = [
  [ 1, 0 ],
  [ 1, 1 ],
  [ 0, 1 ],
  [-1, 1 ],
  [-1, 0 ],
  [-1,-1 ],
  [ 0,-1 ],
  [ 1,-1 ],
];
const DIR8 = OFFSET8.map(dir => normalize(dir));
const A8 = new Array(8).fill().map((n, i) => i*TAU/8);

const RIGHT        = OFFSET8.RIGHT        = DIR8.RIGHT        = 0;
const BOTTOM_RIGHT = OFFSET8.BOTTOM_RIGHT = DIR8.BOTTOM_RIGHT = 1;
const BOTTOM       = OFFSET8.BOTTOM       = DIR8.BOTTOM       = 2;
const BOTTOM_LEFT  = OFFSET8.BOTTOM_LEFT  = DIR8.BOTTOM_LEFT  = 3;
const LEFT         = OFFSET8.LEFT         = DIR8.LEFT         = 4;
const TOP_LEFT     = OFFSET8.TOP_LEFT     = DIR8.TOP_LEFT     = 5;
const TOP          = OFFSET8.TOP          = DIR8.TOP          = 6;
const TOP_RIGHT    = OFFSET8.TOP_RIGHT    = DIR8.TOP_RIGHT    = 7;

const DOWN_RIGHT = OFFSET8.DOWN_RIGHT = DIR8.DOWN_RIGHT = 1;
const DOWN       = OFFSET8.DOWN       = DIR8.DOWN       = 2;
const DOWN_LEFT  = OFFSET8.DOWN_LEFT  = DIR8.DOWN_LEFT  = 3;
const UP_LEFT    = OFFSET8.UP_LEFT    = DIR8.UP_LEFT    = 5;
const UP         = OFFSET8.UP         = DIR8.UP         = 6;
const UP_RIGHT   = OFFSET8.UP_RIGHT   = DIR8.UP_RIGHT   = 7;

const OFFSET4 = [
  [ 1, 0 ],
  [ 0, 1 ],
  [-1, 0 ],
  [ 0,-1 ],
];
const DIR4 = OFFSET4.map(dir => normalize(dir));
const A4 = new Array(4).fill().map((n, i) => i*TAU/4);
const RIGHT4 = 0, BOTTOM4 = 1, LEFT4 = 2, TOP4 = 3;


const mix3 = (a, b, t) => [
  a[X]*(1 - t) + b[X]*t,
  a[Y]*(1 - t) + b[Y]*t,
  a[Z]*(1 - t) + b[Z]*t
]; 
const lerp1 = (a, b, t) => a*(1 - t) + b*t;
const lerp = (a, b, t) => add(scl(a, 1 - t), scl(b, t));
const interpolateBezier = (curve, t) => {
  while (curve.length > 1) {
    let interpolatedPoints = new Array(curve.length - 1);
    for (let i = 0; i < interpolatedPoints.length; ++i) {
      interpolatedPoints[i] = lerp(curve[i], curve[i + 1], t);
    }

    curve = interpolatedPoints;
  }

  return curve[0];
}

const clamp1 = (minS, maxS, s) => min(maxS, max(minS, s));
const clamp2 = ([ minX, minY ], [ maxX, maxY ], v) => [
  min(maxX, max(minX, v[X])),
  min(maxY, max(minY, v[Y])),
];


const pickRandom = ls => ls[floor(random()*ls.length)];
const pickWeighted = (weights, total = 1) => {
  let r = random()*total;
  let sum = 0;
  for (let i = 0; i < weights.length; ++i) {
    sum += weights[i];

    if (sum > r) return i;
  }

  invalidCodePath();
}

const weightedSample = (choices, weights, total = 0, random = Math.random) => {
  if (total <= 0) total = weights.reduce((sum, w) => sum + w, 0);

  let sample = random()*total;
  let sum = 0;
  for (let i = 0; i < weights.length; ++i) {
    sum += weights[i];

    if (sum > sample) return choices[i];
  }

  invalidCodePath();
};


const polygonFromDim = dim => [
  [-dim[X]/2,-dim[Y]/2 ],
  [ dim[X]/2,-dim[Y]/2 ],
  [ dim[X]/2, dim[Y]/2 ],
  [-dim[X]/2, dim[Y]/2 ]
];
const insideOutPolygonFromDim = dim => [
  [-dim[X]/2,-dim[Y]/2 ],
  [-dim[X]/2, dim[Y]/2 ],
  [ dim[X]/2, dim[Y]/2 ],
  [ dim[X]/2,-dim[Y]/2 ]
];



///
/// SAT CODE
///


let findEar = (shape, indices) => {
  for (let i = 0; i < indices.length; ++i) {
    let k = (i + 2)%indices.length;

    let v0 = shape[indices[i]], v2 = shape[indices[k]];

    let proposedEdge = [ v0, v2 ];

    let d = sub(v2, v0);
    let perp = normalize([-d[Y], d[X] ]);
    let interrior = add(v0, scl(d, 0.5));
    interrior = add(interrior, scl(perp, -0.2));
    if (polygonContainsP([ 0, 0 ], 0, indices.map(i => shape[i]), interrior)) {
      let doesIntersect = false;
      for (let ii = 0, jj = shape.length - 1; !doesIntersect && ii < shape.length; jj = ii++) {
        let vii = shape[ii], vjj = shape[jj];
        if (vii != v0 && vii != v2 && vjj != v0 && vjj != v2) {
          let [ intersection, at, bt ] = segSegIntersection(proposedEdge, [ shape[jj], shape[ii] ]);
          doesIntersect = 0.0001 < at && 0.0001 < bt && at <= 1 && bt <= 1;
        }
      }
      if (!doesIntersect) {
        return i;
      }
    }
  }
}

let triangulatePolygon = shape => _triangulatePolygon(shape, shape.map((_, i) => i));
let _triangulatePolygon = (shape, indices) => {
  if (indices.length <= 3) return [ indices ];

  let earIndex = findEar(shape, indices);
  let ear = [];
  for (let i = earIndex; ear.length < 3; i = (i + 1)%indices.length) {
    ear.push(indices[i]);
  }

  indices.splice((earIndex + 1)%indices.length, 1);

  if (earIndex >= 0) return [ ear, ..._triangulatePolygon(shape, indices) ];
  else return _triangulatePolygon(shape, indices);
}

const triangulationCache = new WeakMap();
const meshCache = new WeakMap();
const getMesh = entity => {
  if (!meshCache.has(entity)) {
    if (!triangulationCache.has(entity.shape)) triangulationCache.set(entity, triangulatePolygon(entity.shape));
    let meshIndices = triangulationCache.get(entity);

    let shape = entity.shape.map(v => add(v, entity.p));
    let mesh = meshIndices.map(([ i0, i1, i2 ]) => [ shape[i0], shape[i1], shape[i2] ]);
    meshCache.set(entity, mesh);
  }

  return meshCache.get(entity);
}
const normalsCache = new WeakMap();
const getMeshNormals = entity => {
  if (!normalsCache.has(entity)) {
    let mesh = getMesh(entity);
    let normals = mesh.map(([v0, v1, v2]) => {
      let tmp = normalize(sub(v1, v0));
      let n0 = [-tmp[Y], tmp[X] ];
      
      tmp = normalize(sub(v2, v1));
      let n1 = [-tmp[Y], tmp[X] ];
      
      tmp = normalize(sub(v0, v2));
      let n2 = [-tmp[Y], tmp[X] ];
      return [ n0, n1, n2 ];
    });
    normalsCache.set(entity, normals);
  }
  return normalsCache.get(entity);
}
const getMeshAndNormals = entity => [ getMesh(entity), getMeshNormals(entity) ];

const projectPolygon = (shape, normal) => {
  let projMin = Infinity;
  let projMax =-Infinity;
  shape.forEach(v => {
    let proj = dot(v, normal);
    projMin = min(projMin, proj);
    projMax = max(projMax, proj);
  });
  return [ projMin, projMax ];
};
const sat = (a, normalsA, b, normalsB) => {

  let ai;
  let overlapA = Infinity;
  for (let i = 0; i < normalsA.length; i++) {
    let [ minA, maxA ] = projectPolygon(a, normalsA[i]);
    let [ minB, maxB ] = projectPolygon(b, normalsA[i]);

    let overlap = min(maxA - minB, maxB - minA);
    if ((overlap >= 0 && overlap < overlapA) || (overlap < 0 && (overlapA >= 0  || overlap > overlapA))) {
      overlapA = overlap;
      ai = i;
    }
  }

  let bi;
  let overlapB = Infinity;
  for (let i = 0; i < normalsB.length; i++) {
    let [ minA, maxA ] = projectPolygon(a, normalsB[i]);
    let [ minB, maxB ] = projectPolygon(b, normalsB[i]);

    let overlap = min(maxA - minB, maxB - minA);
    if ((overlap >= 0 && overlap < overlapB) || (overlap < 0 && (overlapB >= 0 || overlap > overlapB))) {
      overlapB = overlap;
      bi = i;
    }
  }

  return [ overlapA < 0 || overlapB < 0, overlapA, ai, overlapB, bi ];
}
const firstOverlap = (as, aNormalss, bs, bNormalss) => {
  let separated = true;
  let satResults = false;
  let ai = 0, bi = 0;
  for (; separated && ai < as.length; ++ai) {
    for (bi = ai; separated && bi < bs.length; ++bi) {
      satResults = sat(as[ai], aNormalss[ai], bs[bi], bNormalss[bi]);
      separated = satResults[0];
    }
  }

  if (separated) return [ true ];
  else {
    let [ separated, aOverlap, aNormalI, bOverlap, bNormalI ] = satResults;
    return [ separated, aOverlap, ai - 1, aNormalI, bOverlap, bi - 1, bNormalI ];
  }

  return separated ? [ true ] : satResults;
}


///
/// SDF
///

const polygonSDF = (p, polygon) => {
  let { p: shapeP, a: shapeA, shape: verts } = polygon;

  let minDist = 10000;

  let _p = sub(p, shapeP); // in object space
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {

    
    let v0 = verts[j], v1 = verts[i];
    let dv = sub(v1, v0);
    let segLen = len(dv);
    let d = scl(dv, 1/segLen);
    let n = [-d[Y], d[X] ];

    let __p = sub(_p, v0); // in segment space, v0 at origin

    let pdotd = dot(__p, d);
    let segT = pdotd/segLen;
    let segDist;
    if (segT >= 1) {
      segDist = dst(v1, _p);
    } else if (segT <= 0) {
      segDist = dst(v0, _p);

    } else {
      let pdotn = dot(__p, n);
      segDist = abs(pdotn);
    }

    minDist = min(segDist, minDist);
     
  }

  if (polygonContainsP(shapeP, shapeA, verts, p)) minDist *= -1; // TODO this could be faster.
  return minDist;
};

const soupSDF = (p, soup) => {
  let minDist = 10000;
  let minPolygon;
  
  soup.forEach(polygon => {
    let { p: shapeP, a: shapeA, shape: verts } = polygon;


    let _p = sub(p, shapeP); // in object space
    for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {

      
      let v0 = verts[j], v1 = verts[i];
      let dv = sub(v1, v0);
      let segLen = len(dv);
      let d = scl(dv, 1/segLen);
      let n = [-d[Y], d[X] ];

      let __p = sub(_p, v0); // in segment space, v0 at origin

      let pdotd = dot(__p, d);
      let segT = pdotd/segLen;
      let segDist;
      if (segT >= 1) {
        segDist = dst(v1, _p);
      } else if (segT <= 0) {
        segDist = dst(v0, _p);

      } else {
        let pdotn = dot(__p, n);
        segDist = abs(pdotn);
      }

      if (segDist < minDist) {
        minDist = segDist;
        minPolygon = polygon;
      }
    }
  });

  if (minPolygon) {
    let { p: shapeP, a: shapeA, shape: verts } = minPolygon;
    if (polygonContainsP(shapeP, shapeA, verts, p)) minDist *= -1; // TODO this could be faster.
  }
  return minDist;
};



///
/// RANDOM
///


let Random = {
  coin: () => round(random()),
  bilateral: () => 2*random() - 1,
  unilateral: () => random(),
  bilateral2: () => [ 2*random() - 1, 2*random() - 1 ],
  unilateral2: () => [ random(), random() ],
};