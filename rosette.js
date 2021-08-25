

function setColors() {
  HUE = int(rnd(0,360))
  DARK_C = color(HUE, 26, 25)
  LIGHT_C = color(hfix(HUE-72), 6, 91)
  LIGHT_GRADIENT_C = color(hfix(max(HUE-72, 0)), 6, 91)
  LIGHTENED_DARK_C = color(HUE, 16, 55)
  ACCENT_C = color(hfix(HUE-145), 80, 64)
  LIGHT_ACCENT_C = color(hfix(HUE-145), 55, 64, 30)
  BRIGHT_LIGHT_C = color(max(HUE-10, 0), 80, 54)
  BRIGHT_DARK_C = BRIGHT_LIGHT_C

  if (prb(0.5)) {
    ROSETTE_FILL_C = DARK_C
    ROSETTE_STROKE_C = LIGHT_C
  } else {
    ROSETTE_FILL_C = LIGHT_C
    ROSETTE_STROKE_C = DARK_C
  }
}



const prb = x => rnd() < x

const posOrNeg = () => prb(0.5) ? 1 : -1


const hfix = h => (h + 360) % 360



const getXYRotation = (deg, radius, cx=0, cy=0) => [
  sin(deg) * radius + cx,
  cos(deg) * radius + cy,
]


const drawShape = (points, getXY, graphic=window) => {

  graphic.beginShape()
  graphic.curveVertex(...getXY(-1))
  times(points+2, p => {
    graphic.curveVertex(...getXY(p), graphic)
  })
  graphic.endShape()
}

function times(t, fn) {
  for (let i = 0; i < t; i++) fn(i)
}


function squigTexture() {
  push()
  noFill()

  strokeWeight(rnd(0.1, 0.5))
  const squigs = 40

  for (let i=0; i<squigs; i++) {
    stroke(prb(0.75) ? DARK_C : ACCENT_C)
    const x = rnd(-width/2, width/2)
    const y = rnd(-height/2, height/2)

    const x1 = x + rnd(-25, 25)
    const x2 = x1 + rnd(-25, 25)
    const x3 = x2 + rnd(-25, 25)
    const y1 = y + rnd(-25, 25)
    const y2 = y1 + rnd(-25, 25)
    const y3 = y2 + rnd(-25, 25)

    beginShape()
    curveVertex(
      x + rnd(-20, 20),
      y + rnd(-20, 20),
    )
    curveVertex(x, y)
    curveVertex(
      x1,
      y1,
    )
    curveVertex(
      x2,
      y2,
    )
    curveVertex(
      x3,
      y3,
    )
    endShape()
  }
  pop()
}

function pointTexture() {
  push()
  for (let x = -width/2; x < width/2; x += 5)
  for (let y = -height/2; y < height/2; y += 5) {
    strokeWeight(rnd(1,2))
    stroke(color(HUE, 26, 25, rnd(0,40)))
    point(x + rnd(-5, 5), y + rnd(-5, 5))
  }
  pop()
}








function rosetteWithBackground(x, y, r, r2=0, params={}) {
  push()
  noFill()
  const p = genRosetteParams(params)

  // dollarRosetteBg(x, y, r, r2, {
  //   ...p,
  //   strokeC: ROSETTE_FILL_C,
  //   fillC: ROSETTE_FILL_C,
  //   strokeMod: 6
  // })


  dollarRosette(x,y, r, params.holeR || r2, {...p, strokeC: ROSETTE_STROKE_C})
  pop()
}


function dollarRosette(x_, y_, maxRad=200, minRad=100, params={}, graphic=window) {
  graphic.push()
  params.strokeC && graphic.stroke(params.strokeC)
  params.fillC && graphic.fill(params.fillC)
  const strokeMod = params.strokeMod || 1

  const c0Points = params.points

  const border = createRosetteBorder(x_, y_, c0Points, params.c1, params.c2, params.r1, params.r2)

  // border
  for (let off=0; off<6; off++) {
    graphic.strokeWeight(((params.strokeW || 0.7) + maxRad/150 - 1) * strokeMod)
    drawShape(c0Points, p => {
      const [ox, oy] = border(maxRad, p, off/3)
      const [ix, iy] = border(maxRad*0.95, p, off/3)

      return p % 2 === 0 ? [ix, iy] : [ox, oy]
    }, graphic)
  }

  let topRad = maxRad
  let bottomRad = maxRad * 0.75
  let i = 0

  while (bottomRad >= minRad && i < 20) {
    graphic.strokeWeight(((params.strokeW || 1) + topRad/150 - 1))
    // awesome misprint
    for (let off=0; off<6; off++) {
      drawShape(c0Points, p => {
        const [ox, oy] = border(topRad, p, off/3)
        const [ix, iy] = border(bottomRad, p, off/3)

        return p % 2 === 0 ? [ix, iy] : [ox, oy]
      }, graphic)
    }

    topRad = bottomRad * 1.045
    if (topRad < 10) {
      bottomRad = 0
    }
    else if (bottomRad - bottomRad*0.75 < 10) {
      bottomRad = topRad - 10
    } else {
      bottomRad = bottomRad*0.75

    }

    i++
  }

  graphic.pop()
}



function dollarRosetteBg(x, y, r, r2, params) {
  dollarRosette(x, y, r, r2, {
    ...params,
    strokeMod: 10
  })

  dollarEchoRosette(x, y, r, r2, params, true)
}

function dollarEchoRosette(x_=0, y_=0, maxRad=200, minRad=100, params={}, bg=false) {
  push()
  params.strokeC && stroke(params.strokeC)
  bg && strokeWeight(2)
  params.strokeW && strokeWeight(params.strokeW)

  const border = createRosetteBorder(x_, y_, params.points, params.c1, params.c2, params.r1, params.r2)
  const r = params.rDiff || (bg ? 1 : 5)
  for (let rad = minRad; rad <= maxRad; rad += r) {
    !bg && !params.ignoreShrink && strokeWeight(rad*params.strokeW/130)
    params.innerC && params.outterC && stroke(lerpColor(
      params.innerC,
      params.outterC,
      (rad - minRad)/(maxRad - minRad)
    ))

    drawShape(params.points, p => {
      return border(rad, p)
    })
  }
  pop()
}



const genRosetteParams = (o) => ({
  c1: int(rnd(1, 16)) * posOrNeg(),
  c2: int(rnd(1, 13)) * posOrNeg(),
  r1: rnd(10, 20),
  r2: rnd(10, 20),
  points: 70,
  ...o
})



const createRosetteBorder = (x_, y_, c0Points, c1, c2, rad1Adj, rad2Adj) => {
  const c1Points = c0Points/c1
  const c2Points = c0Points/c2
  return (rad, p, offset=0, r1a=null, r2a=null) => {
    const angle0 = (p + offset)/c0Points
    const angle1 = (p + offset)/c1Points
    const angle2 = (p + offset)/c2Points

    const r1 = r1a || 1/rad1Adj
    const r2 = r2a || 1/rad2Adj
    const r0 = 1 - r1 - r2

    const [x0, y0] = getXYRotation(
      angle0 * TWO_PI,
      rad * r0,
      x_, y_
    )
    const [x1, y1] = getXYRotation(
      angle1 * TWO_PI,
      rad * r1,
      x0, y0
    )

    return getXYRotation(
      angle2 * TWO_PI,
      rad * r2,
      x1, y1
    )
  }
}
