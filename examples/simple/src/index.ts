import { Sequelize } from '@sequelize/core';
import { IBMiDialect } from '@rcronin/sequelize-ibmi-mapepire';
import 'dotenv/config'
import { DepartmentModel } from './models/test.model';



async function run() {
  const sequelize = new Sequelize({
    dialect: IBMiDialect,
    host: process.env.HOST as string,
    user: process.env.USERNAME as string,
    password: process.env.PASSWORD as string,
    ignoreUnauthorized: true, // false but need to validate certificate
    models: [DepartmentModel]
  });

  const departments = await DepartmentModel.findAll({ raw: true});

  console.dir(departments);

  await sequelize.close();
  process.exit(0)
}

run();

