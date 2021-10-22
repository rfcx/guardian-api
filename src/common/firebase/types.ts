import { Notification, TopicMessage } from 'firebase-admin/messaging'

// export interface PNMessageBase {
//   title: string
//   body: string
// }

// export interface AndroidPNConfig {
//   ttl: number
//   priority: 'normal' | 'high' | undefined
//   notification: PNMessageBase & {
//     sound: string
//   }
// }

// export interface APNSConfig {
//   headers: {
//     'apns-priority': string
//   }
//   payload: {
//     aps: {
//       alert: PNMessageBase
//     }
//   }
// }

// export interface WebPNConfig {
//   notification: PNMessageBase & {
//     icon: string
//   }
// }

// export interface PlatformWidePNMessage {
//   android: AndroidNotification
//   apns: APNSConfig
//   webpush: WebPNConfig
// }

// export interface PNPayload {
//   streamName: string
//   time: string
//   latitude: number
//   longitude: number
//   classificationName: string
// }

export interface PNData extends Notification, TopicMessage {
  topic: string
  data: { [key: string]: string }
}
