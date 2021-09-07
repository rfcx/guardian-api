export default {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN ?? 'auth.rfcx.org',
  CORE_URL: process.env.CORE_URL ?? 'https://staging-api.rfcx.org',
  DB_HOSTNAME: process.env.DB_HOSTNAME ?? 'localhost',
  DB_DBNAME: process.env.DB_DBNAME ?? 'ranger',
  DB_USER: process.env.DB_USER ?? 'admin-user',
  DB_PASSWORD: process.env.DB_PASSWORD ?? 'test'
}
