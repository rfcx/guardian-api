/* eslint @typescript-eslint/no-var-requires: "off" */
const csprng = require('csprng')

export const randomHash = (bits: number): string => {
  return csprng(bits, 36)
}

export const randomString = (length: number): string => {
  return randomHash(320).substr(0, length)
}
