import { DataSource, LoggerOptions } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT != null ? parseInt(process.env.DB_PORT) : 3306,
  username: process.env.DB_USERNAME || 'mysql',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'sample',
  synchronize: false,
  legacySpatialSupport: false,
  migrationsRun: process.env.DB_MIGRATIONS_RUN === '1',
  logging:
    process.env.DB_LOGGING != null
      ? (process.env.DB_LOGGING.split(',') as LoggerOptions)
      : ['query', 'error', 'log'],
  entities: [process.env.DB_TYPEORM_ENTITIES || 'src/**/*.entity.ts'],
  migrations: [process.env.DB_TYPEORM_MIGRATIONS || 'src/migration/**/*.ts'],
  subscribers: [process.env.DB_TYPEORM_SUBSCRIBERS || 'src/subscriber/**/*.ts'],
  extra: {
    charset: 'utf8mb4',
    socketPath: process.env.DB_SOCKET_PATH,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  },
  
});