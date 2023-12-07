import { Application, Container, Graphics, ColorSource, Text } from "pixi.js"

class Gob {
  position = { x: 0, y: 0 }
  pivot = [0, 0]
  anchor = [0, 0]
  size = { width: 0, height: 0 }
  color: ColorSource = 0xffffff
  rotation = 0
  scale = { x: 1, y: 1 }
  kids: Gob[] = []
  debug = false

  constructor() {}

  toPixi() {
    const graphics = new Graphics()
    graphics.rect(0, 0, this.size.width, this.size.height)
    graphics.fill({ color: this.color })
    graphics.pivot = { x: this.size.width * this.pivot[0], y: this.size.height * this.pivot[1] }
    graphics.rotation = this.rotation
    graphics.scale = this.scale
    graphics.position = {
      x: graphics.pivot.x,
      y: graphics.pivot.y,
    }

    const container = new Container()
    // This is actually the anchor
    container.pivot = { x: this.size.width * this.anchor[0], y: this.size.height * this.anchor[1] }
    container.position = this.position

    container.addChild(graphics)
    if (this.debug) {
      const pivotGraphics = new Graphics()
      pivotGraphics.circle(graphics.pivot.x, graphics.pivot.y, 6)
      pivotGraphics.fill({ color: [0, 1, 0, 1] })

      const anchorGraphics = new Graphics()
      anchorGraphics.circle(container.pivot.x, container.pivot.y, 3)
      anchorGraphics.fill({ color: [1, 0, 0, 1] })
      container.addChild(pivotGraphics, anchorGraphics)
    }

    if (this.kids.length > 0) {
      graphics.addChild(...this.kids.map((kid) => kid.toPixi()))
    }

    return container
  }
}

const wave = (t: number, min: number, max: number) => {
  const range = max - min

  const zeroToOne = (Math.sin(t / 1000) + 1) / 2
  return zeroToOne * range + min
}

const app = new Application()
await app.init({ width: 800, height: 600, backgroundColor: 0x1099bb })
document.body.appendChild(app.canvas)

const positions = {
  topLeft: [0, 0],
  topCenter: [0.5, 0],
  topRight: [1, 0],
  centerLeft: [0, 0.5],
  center: [0.5, 0.5],
  centerRight: [1, 0.5],
  bottomLeft: [0, 1],
  bottomCenter: [0.5, 1],
  bottomRight: [1, 1],
}

let pivot: keyof typeof positions = "topLeft"
let anchor: keyof typeof positions = "topLeft"
let animated = true

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    pivot = Object.keys(positions)[(Object.keys(positions).indexOf(pivot) - 1 + 9) % 9] as keyof typeof positions
  }
  if (e.key === "ArrowRight") {
    pivot = Object.keys(positions)[(Object.keys(positions).indexOf(pivot) + 1) % 9] as keyof typeof positions
    console.log(pivot)
  }
  if (e.key === "ArrowUp") {
    anchor = Object.keys(positions)[(Object.keys(positions).indexOf(anchor) - 1 + 9) % 9] as keyof typeof positions
  }
  if (e.key === "ArrowDown") {
    anchor = Object.keys(positions)[(Object.keys(positions).indexOf(anchor) + 1) % 9] as keyof typeof positions
  }
  if (e.key === " ") {
    animated = !animated
  }
})

const gob = new Gob()
gob.debug = true
gob.position = { x: app.canvas.width / 2, y: app.canvas.height / 2 }
gob.size = { width: 100, height: 100 }
gob.color = "purple"

const leftArm = new Gob()
leftArm.position = { x: 0, y: 50 }
leftArm.size = { width: 50, height: 10 }
leftArm.color = "blue"
leftArm.pivot = [1, 0.5]
leftArm.anchor = [1, 0.5]
leftArm.debug = false
gob.kids.push(leftArm)

const rightArm = new Gob()
rightArm.position = { x: 100, y: 50 }
rightArm.size = { width: 50, height: 10 }
rightArm.pivot = [0, 0.5]
rightArm.anchor = [0, 0.5]
rightArm.color = "pink"
rightArm.debug = false
gob.kids.push(rightArm)

const eye = new Gob()
eye.position = { x: 50, y: 0 }
eye.size = { width: 25, height: 25 }
eye.color = "white"
eye.pivot = [0.5, 0.5]
eye.anchor = [0.5, 1]
eye.debug = false
gob.kids.push(eye)

app.ticker.add(({ lastTime }) => {
  app.stage.removeChildren()
  if (animated) {
    gob.rotation = wave(lastTime, Math.PI, -Math.PI)
    const value = wave(lastTime / 100, 1, 1.5)
    gob.scale = { x: value, y: value }
    leftArm.rotation = wave(lastTime * 2, Math.PI / 2, -Math.PI / 2)
    rightArm.rotation = wave(lastTime * 3, Math.PI / 2, -Math.PI / 2)
    eye.rotation = wave(lastTime * 3, Math.PI / 2, -Math.PI / 2)
  } else {
    gob.rotation = 0
    gob.scale = { x: 1, y: 1 }
    leftArm.rotation = 0
  }

  gob.pivot = positions[pivot]
  gob.anchor = positions[anchor]

  const text = new Text({
    text: `press the arrow keys and space to toggle these values\npivot: ${pivot}\nanchor: ${anchor}\nanimated: ${animated}`,
    renderMode: "canvas",
  })

  app.stage.addChild(gob.toPixi())
  app.stage.addChild(text)
})
