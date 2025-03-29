import { Sequelize, Options } from 'sequelize';

const env = process.env.NODE_ENV || 'development';

interface DbConfig extends Options {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  logging?: boolean | ((sql: string) => void);
}

const config: Record<string, DbConfig> = {
  development: {
    username: 'postgres',
    password: 'postgres',
    database: 'mechanism_sharing_development',
    host: 'localhost',
    dialect: 'postgres',
    port: 5432
  },
  test: {
    username: 'postgres',
    password: 'postgres',
    database: 'mechanism_sharing_test',
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: false
  },
  production: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mechanism_sharing_production',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: Number(process.env.DB_PORT) || 5432
  }
};

const dbConfig = config[env as keyof typeof config];

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: 'postgres',
    port: dbConfig.port,
    logging: dbConfig.logging !== undefined ? dbConfig.logging : console.log
  }
);

export default config;
