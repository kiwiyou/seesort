import { sampleDistinct } from './sampler'
import { BubbleSort } from './sort'
import './style.css'

const app = document.querySelector<HTMLCanvasElement>('#app')!
const appWidth = app.clientWidth
const appHeight = app.clientHeight
app.width = appWidth
app.height = appHeight

const context = app.getContext('2d')!

const [sample, range] = sampleDistinct(10)
for (let i = 1; i < sample.length; ++i) {
  const shuffle = Math.floor(Math.random() * (i + 1))
  const tmp = sample[i]
  sample[i] = sample[shuffle]
  sample[shuffle] = tmp
}

const bubble = BubbleSort(context, 20, 20, appWidth - 40, appHeight - 40)
bubble.theme.swapDuration = 500
bubble.theme.compareDuration = 100
bubble.begin(sample, range)
bubble.next()
