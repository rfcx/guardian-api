import { MessageQueue } from '@rfcx/message-queue'
import { EventSQSMessage } from './types'
import { createEvent } from './service'

if (process.env.EVENTS_SQS_QUEUE_ENABLED === 'true') {
  const messageQueue = new MessageQueue('sqs')
  const topic = process.env.EVENTS_SQS_QUEUE as string
  console.log(`Subsribing to SQS topic "${topic}"`)
  messageQueue.subscribe(topic, async (data: EventSQSMessage) => {
    try {
      console.log('New message with event received', data)
      await createEvent(data)
    } catch (e) {
      console.error('Error creating event', e)
      return false
    }
    return true
  })
}
