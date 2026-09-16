import { createHash, randomBytes } from 'crypto'

// OPEN-ITEMS §271: the request logger used to write the caller's COMPLETE
// `Authorization: Bearer <JWT>` header into pod logs, which promtail ships to
// Loki (retention 336h). Measured on prod 2026-09-15 across this estate: 100%
// of sampled tokens were still valid at read time, with observed lifetimes of
// 30/90/365 days -- i.e. the logs held live, replayable user credentials.
//
// Three properties this module deliberately has:
//
//  1. A FIXED MARKER, NOT A TRUNCATION. A JWT prefix still contains the header
//     and (base64) payload, and the payload IS the identity -- so logging the
//     "first N characters" would leak exactly what we are trying to protect.
//
//  2. A SHORT, NON-REVERSIBLE FINGERPRINT, so support can still correlate
//     several log lines as "the same caller" without the log holding a
//     credential. The salt defaults to a per-PROCESS random value: that keeps
//     fingerprints correlatable within one pod's logs (the support use case)
//     while making them useless as a cross-pod identifier or a dictionary
//     target. Set LOG_REDACTION_SALT to correlate across pods on purpose.
//
//  3. THE ABSENT/ANONYMOUS CASES PASS THROUGH UNCHANGED. `undefined` on this
//     field is real signal (anonymous traffic), so it must stay
//     distinguishable from a redacted credential.
const SALT = process.env.LOG_REDACTION_SALT ?? randomBytes(16).toString('hex')

const fingerprint = (value: string): string => {
  return createHash('sha256').update(SALT).update(value).digest('hex').slice(0, 8)
}

/**
 * Redact a credential-bearing header value for logging.
 *
 * Returns the value unchanged when there is no credential to protect, so that
 * "no Authorization header" stays visible in the logs as before.
 */
export const redactCredential = (value: string | undefined): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return value
  }
  const raw = String(value)
  // Preserve the meaningful "no credential" markers verbatim -- they are
  // signal, not secrets, and downstream eyeballs/greps rely on them.
  if (raw === 'undefined' || raw === 'null' || raw === 'none') {
    return raw
  }
  const match = /^(Bearer|Basic|Token)\s+(.+)$/i.exec(raw)
  if (match !== null) {
    return `${match[1]} [REDACTED:${fingerprint(match[2])}]`
  }
  // A bare credential with no scheme prefix.
  return `[REDACTED:${fingerprint(raw)}]`
}
