import { hsluvToHex } from 'hsluv'

export interface BubbleSortItem {
  value: number,
  offset: [number, number],
  focused: boolean,
  sorted: boolean,
}

export function newItem(value: number): BubbleSortItem {
  return {
    value,
    offset: [0, 0],
    focused: false,
    sorted: false,
  }
}

export function BubbleSort(
  context: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number
) {
  const theme = {
    hue: 0,
    saturation: 0,
    fontFamily: 'Pretendard',
    gap: 5,
    strokeWidth: 2,
    strokeColor: 'black',
    sortedColor: 'yellowgreen',
    focusedColor: 'red',
    swapDuration: 1000,
    compareDuration: 1000,
    easingFunction: (x: number) => (1 - Math.pow(1 - x, 4))
  }

  let array: BubbleSortItem[] = []
  let range: [number, number] = [0, 0]

  let baseRadius = 0
  let ascent = 0

  function getElementPosition(i: number) {
    const element = array[i]
    const [min, ] = range
    const x = left + theme.gap * i + baseRadius * (2 * i + 1) + theme.strokeWidth
    const y = top + ascent * (array.length - 1 - (element.value - min)) + baseRadius + theme.strokeWidth
    return [x, y]
  }
  
  function drawElement(i: number) {
    const element = array[i]
    const [x, y] = getElementPosition(i)
    const [offsetX, offsetY] = element.offset
    const [min, max] = range
    const radius = baseRadius
    const brightness = 100 * element.value / (max - min + 1)
    const color = hsluvToHex([theme.hue, theme.saturation, brightness])
    context.fillStyle = color
    context.strokeStyle = element.focused ? theme.focusedColor : element.sorted ? theme.sortedColor : theme.strokeColor
    context.lineWidth = theme.strokeWidth
    context.beginPath()
    context.ellipse(x + offsetX, y + offsetY, radius, radius, 0, 0, 2 * Math.PI)
    context.fill()
    context.stroke()
    context.closePath()
    context.textAlign = 'center'
    context.fillStyle = element.focused ? theme.focusedColor : element.sorted ? theme.sortedColor : brightness > 50 ? 'black' : 'white'
    context.textBaseline = 'alphabetic'
    context.font = `${radius}px ${theme.fontFamily}`
    const text = element.value.toString()
    const measure = context.measureText(text)
    const textHeight = measure.actualBoundingBoxAscent
    context.fillText(text, x, y + textHeight / 2)
  }

  function drawArray() {
    for (let i = 0; i < array.length; ++i) {
      drawElement(i)
    }
  }

  let round = 0
  let cursor = 1

  let nextAnimation: null | (() => void) = null

  function begin(sample: number[], sample_range: [number, number]) {
    context.clearRect(left, top, width, height)

    if (sample.length < 1 || sample_range[0] > sample_range[1]) {
      nextAnimation = null
      return
    }

    array = sample.map(newItem)
    range = sample_range

    round = 0
    cursor = 1

    // n = sample length
    // width = (n - 1) * gap + n * (2 * radius) + 2 * strokeWidth
    baseRadius = (width - 2 * theme.strokeWidth - (sample.length - 1) * theme.gap) / (2 * sample.length)

    // height = (n - 1) * ascent + 2 * radius + 2 * strokeWidth
    ascent = (height - 2 * (baseRadius + theme.strokeWidth)) / (sample.length - 1)

    drawArray()

    nextAnimation = compare
  }

  function advanceCursor() {
    cursor += 1
    if (cursor >= array.length - round) {
      array[array.length - round - 1].sorted = true
      round += 1
      cursor = 1
      if (round >= array.length) {
        nextAnimation = finish
        return
      }
    }
    nextAnimation = compare
  }

  function compare() {
    array.forEach(element => element.focused = false)
    array[cursor - 1].focused = true
    array[cursor].focused = true
    context.clearRect(left, top, width, height)
    drawArray()
    if (array[cursor - 1].value > array[cursor].value) {
      nextAnimation = swap
    } else {
      advanceCursor()
    }
    setTimeout(next, theme.compareDuration)
  }

  let subAnimation: number | null = null
  function swap() {
    let duration = 0
    const left = cursor - 1
    const right = cursor
    const tmp = array[cursor]
    array[cursor] = array[cursor - 1]
    array[cursor - 1] = tmp
    advanceCursor()
    let last_time: number | undefined = undefined
    const callback = (time: number) => {
      if (last_time === undefined) {
        last_time = time
      }
      duration = Math.min(duration + time - last_time, theme.swapDuration)
      const [leftX, ] = getElementPosition(left)
      const [rightX, ] = getElementPosition(right)
      const offset = (rightX - leftX) * (1 - theme.easingFunction(duration / theme.swapDuration))
      console.log(rightX - leftX, duration, theme.swapDuration)
      array[left].offset[0] = offset
      array[right].offset[0] = -offset
      context.clearRect(left, top, width, height)
      drawArray()
      if (duration < theme.swapDuration) {
        subAnimation = requestAnimationFrame(callback)
      } else {
        subAnimation = null
      }
    }
    subAnimation = requestAnimationFrame(callback)
    setTimeout(next, theme.swapDuration)
  }

  function finish() {
    array.forEach(element => element.focused = false)
    context.clearRect(left, top, width, height)
    drawArray()
    nextAnimation = null
  }

  function next() {
    if (subAnimation != null) {
      cancelAnimationFrame(subAnimation)
      subAnimation = null
    }
    if (nextAnimation != null) {
      nextAnimation()
    }
  }

  return {
    theme,
    begin,
    next
  }
}
