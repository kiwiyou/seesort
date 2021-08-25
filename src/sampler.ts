export type Sampler = (length: number) => [number[], [number, number]]

export const sampleDistinct: Sampler = (length: number) => {
  const sample = []
  for (let i = 1; i <= length; ++i) {
    sample.push(i)
  }
  return [sample, [1, length]]
}
