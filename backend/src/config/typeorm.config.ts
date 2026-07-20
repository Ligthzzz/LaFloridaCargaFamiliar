import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('typeorm', (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL;

  return {
    type: 'postgres',
    ...(databaseUrl
      ? { url: databaseUrl, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
        }),
    autoLoadEntities: true,
    synchronize: process.env.DB_SYNCHRONIZE !== 'false',
  };
});
