import { Application, Container, Graphics } from "pixi.js"

const app = new Application()
await app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
})

document.body.appendChild(app.canvas)

const body = new Graphics()
body.position = { x: 100, y: 100 }
body.rect(0, 0, 100, 100)
body.fill({ color: [1, 0, 0, 1] })
body.pivot = { x: 100, y: 100 }

const pivot = new Graphics()
pivot.circle(body.pivot.x, body.pivot.y, 6)
pivot.fill({ color: [0, 1, 0, 1] })

const container = new Container()
container.position = { x: 100, y: 100 }
container.pivot = { x: 100, y: 100 }

const anchor = new Graphics()
anchor.circle(container.pivot.x, container.pivot.y, 3)
anchor.fill({ color: [1, 0, 0, 1] })

const rightArm = new Graphics()
rightArm.position = { x: 100, y: 50 }
rightArm.rect(0, 0, 50, 10)
rightArm.fill({ color: [0, 0, 1, 1] })
body.addChild(rightArm)

container.addChild(body, pivot, anchor)
app.stage.addChild(container)

app.ticker.add(({ lastTime }) => {
  body.rotation = wave(lastTime, 0, Math.PI)
  const value = wave(lastTime, 1, 2)
  // body.scale = { x: value, y: value }
  rightArm.rotation = wave(lastTime * 2, Math.PI / 2, -Math.PI / 2)
})

const wave = (t: number, min: number, max: number) => {
  const range = max - min

  const zeroToOne = (Math.sin(t / 1000) + 1) / 2
  return zeroToOne * range + min
}
