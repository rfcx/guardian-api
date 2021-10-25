// import { credential, initializeApp } from 'firebase-admin'
import * as admin from 'firebase-admin'
import { TopicMessage, AndroidConfig, ApnsConfig, WebpushConfig } from 'firebase-admin/messaging'
import { PNData } from '../../types'
import config from '../../config'

const cred = admin.credential.cert({
  projectId: 'rfcx-ranger',
  clientEmail: config.FIREBASE_CLIENT_EMAIL,
  privateKey: `-----BEGIN PRIVATE KEY-----\n${config.FIREBASE_PRIVATE_KEY}\n-----END PRIVATE KEY-----\n`
})

const rangerApp = admin.initializeApp({ credential: cred }, 'rangerApp')

const customizedMessage: { android: AndroidConfig, apns: ApnsConfig, webpush: WebpushConfig } = {
  android: {
    ttl: 3600 * 1000, // 1 hour in milliseconds
    priority: 'high',
    notification: {
      sound: 'default',
      priority: 'max'
    }
  },
  apns: {
    headers: {
      'apns-priority': '10'
    }
  },
  webpush: {
    notification: {
      icon: 'https://static.rfcx.org/logo/logo-square-192.png'
    }
  }
}

export const sendToTopic = async (pn: PNData): Promise<string> => {
  const { title, body, data, topic } = pn
  return await sendMessage({
    notification: { title, body },
    ...customizedMessage,
    data,
    topic
  })
}

async function sendMessage (message: TopicMessage): Promise<string> {
  return await rangerApp
    .messaging()
    .send(message)
}
