import { MessageQueue } from '@rfcx/message-queue'
import { EventSQSMessage } from './types'
import { createEvent, updateEvent, sendPushNotification } from './service'

if (process.env.SQS_ENABLED === 'true') {
  const messageQueue = new MessageQueue('sqs')
  const eventCreatedTopic = process.env.SQS_EVENT_CREATED as string
  console.log(`Subsribing to SQS topic "${eventCreatedTopic}"`)
  messageQueue.subscribe(eventCreatedTopic, async (data: EventSQSMessage) => {
    try {
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

  const eventUpdatedTopic = process.env.SQS_EVENT_CREATED as string
  console.log(`Subsribing to SQS topic "${eventUpdatedTopic}"`)
  messageQueue.subscribe(eventUpdatedTopic, async (data: EventSQSMessage) => {
    try {
      await updateEvent(data)
    } catch (e) {
      console.error('Error updating event', e)
      return false
    }
    return true
  })
}
