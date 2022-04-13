import { MessageQueue } from '@rfcx/message-queue'
import { EventSQSMessage } from './types'
import { createEvent, updateEvent, sendPushNotification } from './service'

// TODO Share with rfcx-api/common
const EVENT_CREATED = 'eventCreated'
const EVENT_UPDATED = 'eventUpdated'

if (process.env.MESSAGE_QUEUE_ENABLED === 'true') {
  const topicPrefix = process.env.MESSAGE_QUEUE_PREFIX as string
  const messageQueue = new MessageQueue('sqs', { topicPrefix })

  console.log(`Subscribing to SQS topic "${topicPrefix}-${EVENT_CREATED}"`)
  messageQueue.subscribe(EVENT_CREATED, async (data: EventSQSMessage) => {
    try {
      const result = await createEvent(data)
      console.log('Event is created', result?.event.id)
      if (result !== null) {
        await sendPushNotification(result.coreEvent, result.coreStream)
      }
    } catch (e) {
      console.error('Error creating event', e)
      return false
    }
    return true
  })

  console.log(`Subscribing to SQS topic "${topicPrefix}-${EVENT_UPDATED}"`)
  messageQueue.subscribe(EVENT_UPDATED, async (data: EventSQSMessage) => {
    try {
      const id = await updateEvent(data)
      console.log('Event is updated', id)
    } catch (e) {
      console.error('Error updating event', e)
      return false
    }
    return true
  })
}
