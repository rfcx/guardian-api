import ffmpeg from 'fluent-ffmpeg'

interface ConvertOptions {
  acodec?: string
}

export const convert = async function (srcPath: string, destPath: string, options: ConvertOptions = {}): Promise<void> {
  return await new Promise((resolve, reject) => {
    const outputOpts: string[] = []
    if (options.acodec !== undefined) {
      outputOpts.push(`-acodec ${options.acodec}`)
    }
    const command = ffmpeg(srcPath)
      .noVideo()
      .output(destPath)
      .outputOptions(outputOpts)

    const timeout = setTimeout(() => {
      command.kill('SIGSTOP')
      reject(Error('Timeout'))
    }, 60000)

    command
      .on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
      .on('end', () => {
        clearTimeout(timeout)
        resolve()
      })
      .run()
  })
}
