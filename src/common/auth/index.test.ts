import { muteConsole } from '../db/testing'
import { parseUserData } from './index'

beforeAll(async () => {
  muteConsole()
})

describe('parseUserData middleware function', () => {
  test('parses standard user token data', async () => {
    const req = {
      auth: {
        'https://rfcx.org/app_metadata': {
          authorization: {
            roles: [
              'rfcxUser'
            ]
          },
          loginsNumber: 172,
          accessibleSites: ['foo', 'bar'],
          defaultSite: 'foo'
        },
        'https://rfcx.org/user_metadata': {
          consentGivenDashboard: true,
          consentGivenAcousticsExplorer: true,
          consentGivenRangerApp: true
        },
        given_name: 'John',
        family_name: 'Doe',
        nickname: 'john',
        name: 'john@doe.org',
        picture: 'https://s.gravatar.com/avatar/80f17c02b0939ee635d39bcace3a6d4d?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fra.png',
        updated_at: '2021-09-27T16:02:49.198Z',
        email: 'john@doe.org',
        email_verified: true,
        guid: 'op124af4-26c3-42e0-8367-22516d1re88a',
        iss: 'https://some.site.org/',
        sub: 'auth0|5fa13093c5fb6300798e9qop',
        aud: 'BhesDnKTjs6ahr7s44d7GJok28FIrMKj',
        iat: '1632754166',
        exp: '1640648571'
      }
    }
    parseUserData(req as any, {} as any, () => {})
    expect((req as any).user.firstname).toBe('John')
    expect((req as any).user.lastname).toBe('Doe')
    expect((req as any).user.email).toBe('john@doe.org')
    expect((req as any).user.guid).toBe('op124af4-26c3-42e0-8367-22516d1re88a')
  })
  test('parses user token data with name in custom user metadata', async () => {
    const req = {
      auth: {
        'https://rfcx.org/app_metadata': {
          authorization: {
            roles: [
              'rfcxUser'
            ]
          },
          guid: 'op124af4-26c3-42e0-8367-22516d1re88a',
          loginsNumber: 172,
          accessibleSites: ['foo', 'bar'],
          defaultSite: 'foo'
        },
        'https://rfcx.org/user_metadata': {
          name: 'John Doe',
          given_name: 'John',
          family_name: 'Doe',
          consentGivenDashboard: true,
          consentGivenAcousticsExplorer: true,
          consentGivenRangerApp: true
        },
        nickname: 'john',
        name: 'john@doe.org',
        picture: 'https://s.gravatar.com/avatar/80f17c02b0939ee635d39bcace3a6d4d?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fra.png',
        updated_at: '2021-09-27T16:02:49.198Z',
        email: 'john@doe.org',
        email_verified: true,
        iss: 'https://some.site.org/',
        sub: 'auth0|5fa13093c5fb6300798e9qop',
        aud: 'BhesDnKTjs6ahr7s44d7GJok28FIrMKj',
        iat: '1632754166',
        exp: '1640648571'
      }
    }
    parseUserData(req as any, {} as any, () => {})
    expect((req as any).user.firstname).toBe('John')
    expect((req as any).user.lastname).toBe('Doe')
    expect((req as any).user.email).toBe('john@doe.org')
    expect((req as any).user.guid).toBe('op124af4-26c3-42e0-8367-22516d1re88a')
  })
  test('parses user token data with guid in custom app metadata', async () => {
    const req = {
      auth: {
        'https://rfcx.org/app_metadata': {
          authorization: {
            roles: [
              'rfcxUser'
            ]
          },
          guid: 'op124af4-26c3-42e0-8367-22516d1re88b',
          loginsNumber: 172,
          accessibleSites: ['foo', 'bar'],
          defaultSite: 'foo'
        },
        'https://rfcx.org/user_metadata': {
          consentGivenDashboard: true,
          consentGivenAcousticsExplorer: true,
          consentGivenRangerApp: true
        },
        given_name: 'John',
        family_name: 'Doe',
        nickname: 'john',
        name: 'john@doe.org',
        picture: 'https://s.gravatar.com/avatar/80f17c02b0939ee635d39bcace3a6d4d?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fra.png',
        updated_at: '2021-09-27T16:02:49.198Z',
        email: 'john@doe.org',
        email_verified: true,
        iss: 'https://some.site.org/',
        sub: 'auth0|5fa13093c5fb6300798e9qop',
        aud: 'BhesDnKTjs6ahr7s44d7GJok28FIrMKj',
        iat: '1632754166',
        exp: '1640648571'
      }
    }
    parseUserData(req as any, {} as any, () => {})
    expect((req as any).user.firstname).toBe('John')
    expect((req as any).user.lastname).toBe('Doe')
    expect((req as any).user.email).toBe('john@doe.org')
    expect((req as any).user.guid).toBe('op124af4-26c3-42e0-8367-22516d1re88b')
  })
  test('parses user token data without email', async () => {
    const req = {
      auth: {
        'https://rfcx.org/app_metadata': {
          authorization: {
            roles: [
              'rfcxUser'
            ]
          },
          loginsNumber: 172,
          accessibleSites: ['foo', 'bar'],
          defaultSite: 'foo'
        },
        'https://rfcx.org/user_metadata': {
          consentGivenDashboard: true,
          consentGivenAcousticsExplorer: true,
          consentGivenRangerApp: true
        },
        given_name: 'John',
        family_name: 'Doe',
        nickname: 'john',
        name: 'john@doe.org',
        picture: 'https://s.gravatar.com/avatar/80f17c02b0939ee635d39bcace3a6d4d?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fra.png',
        updated_at: '2021-09-27T16:02:49.198Z',
        email_verified: true,
        guid: 'op124af4-26c3-42e0-8367-22516d1re88a',
        iss: 'https://some.site.org/',
        sub: 'auth0|5fa13093c5fb6300798e9qop',
        aud: 'BhesDnKTjs6ahr7s44d7GJok28FIrMKj',
        iat: '1632754166',
        exp: '1640648571'
      }
    }
    parseUserData(req as any, {} as any, () => {})
    expect((req as any).user.firstname).toBe('John')
    expect((req as any).user.lastname).toBe('Doe')
    expect((req as any).user.email).toBeUndefined()
    expect((req as any).user.guid).toBe('op124af4-26c3-42e0-8367-22516d1re88a')
  })
  test('parses user token data without guid', async () => {
    const req = {
      auth: {
        'https://rfcx.org/app_metadata': {
          authorization: {
            roles: [
              'rfcxUser'
            ]
          },
          loginsNumber: 172,
          accessibleSites: ['foo', 'bar'],
          defaultSite: 'foo'
        },
        'https://rfcx.org/user_metadata': {
          consentGivenDashboard: true,
          consentGivenAcousticsExplorer: true,
          consentGivenRangerApp: true
        },
        given_name: 'John',
        family_name: 'Doe',
        nickname: 'john',
        name: 'john@doe.org',
        picture: 'https://s.gravatar.com/avatar/80f17c02b0939ee635d39bcace3a6d4d?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fra.png',
        updated_at: '2021-09-27T16:02:49.198Z',
        email: 'john@doe.org',
        email_verified: true,
        iss: 'https://some.site.org/',
        sub: 'auth0|5fa13093c5fb6300798e9qop',
        aud: 'BhesDnKTjs6ahr7s44d7GJok28FIrMKj',
        iat: '1632754166',
        exp: '1640648571'
      }
    }
    parseUserData(req as any, {} as any, () => {})
    expect((req as any).user.firstname).toBe('John')
    expect((req as any).user.lastname).toBe('Doe')
    expect((req as any).user.email).toBe('john@doe.org')
    expect((req as any).user.guid).toBeUndefined()
  })
  test('parses user data without firstname and lastname', async () => {
    const req = {
      auth: {
        'https://rfcx.org/app_metadata': {
          authorization: {
            roles: [
              'rfcxUser'
            ]
          },
          guid: 'op124af4-26c3-42e0-8367-22516d1re88a',
          loginsNumber: 172,
          accessibleSites: ['foo', 'bar'],
          defaultSite: 'foo'
        },
        'https://rfcx.org/user_metadata': {
          consentGivenDashboard: true,
          consentGivenAcousticsExplorer: true,
          consentGivenRangerApp: true
        },
        nickname: 'john',
        name: 'john@doe.org',
        picture: 'https://s.gravatar.com/avatar/80f17c02b0939ee635d39bcace3a6d4d?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fra.png',
        updated_at: '2021-09-27T16:02:49.198Z',
        email: 'john@doe.org',
        email_verified: true,
        iss: 'https://some.site.org/',
        sub: 'auth0|5fa13093c5fb6300798e9qop',
        aud: 'BhesDnKTjs6ahr7s44d7GJok28FIrMKj',
        iat: '1632754166',
        exp: '1640648571'
      }
    }
    parseUserData(req as any, {} as any, () => {})
    expect((req as any).user.firstname).toBeUndefined()
    expect((req as any).user.lastname).toBeUndefined()
    expect((req as any).user.email).toBe('john@doe.org')
    expect((req as any).user.guid).toBe('op124af4-26c3-42e0-8367-22516d1re88a')
  })
})
