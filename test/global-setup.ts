import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({ path: '.env.test.local' });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: Number(process.env.POSTGRES_PORT),
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: false,
});

module.exports = async function () {
  console.log('Cleaning..');
  await dataSource.initialize();

  const queryRunner = dataSource.createQueryRunner();
  const tables = await queryRunner.getTables(['user']);

  try {
    await queryRunner.startTransaction();
    await queryRunner.query(`SET session_replication_role = 'replica';`);
    for (const table of tables) {
      await queryRunner.query(
        `TRUNCATE TABLE "${table.name}" RESTART IDENTITY CASCADE;`,
      );
    }
    await queryRunner.query(`SET session_replication_role = 'origin';`);
    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
};
