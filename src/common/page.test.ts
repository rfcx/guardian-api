import { limitAndOffset } from './page'

const arr = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30
]

describe('limitAndOffset method', () => {
  test('returns 10 items with limit 10 and offset 0', () => {
    const limited = limitAndOffset(arr, 10, 0)
    expect(limited.length).toBe(10)
    expect(limited[0]).toBe(1)
    expect(limited[9]).toBe(10)
  })
  test('returns 10 items with limit 10 and offset 10', () => {
    const limited = limitAndOffset(arr, 10, 10)
    expect(limited.length).toBe(10)
    expect(limited[0]).toBe(11)
    expect(limited[9]).toBe(20)
  })
  test('returns 2 items with limit 10 and offset 28', () => {
    const limited = limitAndOffset(arr, 10, 28)
    expect(limited.length).toBe(2)
    expect(limited[0]).toBe(29)
    expect(limited[1]).toBe(30)
  })
  test('returns 0 items with limit 10 and offset 30', () => {
    const limited = limitAndOffset(arr, 10, 30)
    expect(limited.length).toBe(0)
  })
  test('returns 0 items with limit 0 and offset 0', () => {
    const limited = limitAndOffset(arr, 0, 0)
    expect(limited.length).toBe(0)
  })
  test('returns 0 items with limit 0 and offset 10', () => {
    const limited = limitAndOffset(arr, 0, 10)
    expect(limited.length).toBe(0)
  })
  test('returns 0 items with limit 0 and offset 30', () => {
    const limited = limitAndOffset(arr, 0, 30)
    expect(limited.length).toBe(0)
  })
  test('returns 30 items with limit 30 and offset 0', () => {
    const limited = limitAndOffset(arr, 30, 0)
    expect(limited.length).toBe(30)
    expect(limited[0]).toBe(1)
    expect(limited[29]).toBe(30)
  })
  test('returns 28 items with limit 30 and offset 2', () => {
    const limited = limitAndOffset(arr, 30, 2)
    expect(limited.length).toBe(28)
    expect(limited[0]).toBe(3)
    expect(limited[27]).toBe(30)
  })
  test('throws an error if limit is less than 0', () => {
    expect(() => { limitAndOffset(arr, -2, 0) }).toThrow('limit must be greater than or equal to 0')
  })
  test('throws an error if offset is less than 0', () => {
    expect(() => { limitAndOffset(arr, 10, -3) }).toThrow('offset must be greater than or equal to 0')
  })
})
