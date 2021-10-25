import { MessageQueue } from '@rfcx/message-queue'
import { EventSQSMessage } from './types'
import { createEvent, sendPushNotification } from './service'

if (process.env.EVENTS_SQS_QUEUE_ENABLED === 'true') {
  const messageQueue = new MessageQueue('sqs')
  const topic = process.env.EVENTS_SQS_QUEUE as string
  console.log(`Subsribing to SQS topic "${topic}"`)
  messageQueue.subscribe(topic, async (data: EventSQSMessage) => {
    try {
      console.log('New message with event received', data)
      const result = await createEvent(data)
      if (result !== null) {
        await sendPushNotification(result.coreEvent, result.coreStream)
      }
    } catch (e) {
      console.error('Error creating event', e)
      return false
    }
    return true
  })
}
