import { Sequelize } from '@sequelize/core';
import { IBMiDialect } from '@rcronin/sequelize-ibmi-mapepire';
import 'dotenv/config'
import { DepartmentModel } from './models/department.model';



async function run() {
  console.time('run');
  const sequelize = new Sequelize({
    dialect: IBMiDialect,
    host: process.env.HOST as string,
    user: process.env.USERNAME as string,
    password: process.env.PASSWORD as string,
    rejectUnauthorized: false, // false but need to validate certificate
    models: [DepartmentModel]
  });

  const departments = await DepartmentModel.findAll({ where: { parent: 'E01' }});

  // easy way to serialize model - not recommended for production
  console.dir(departments.map(d => JSON.parse(JSON.stringify(d))));

  console.log(await sequelize.query('select * from ltl400mod3.frp010'))

  await sequelize.close();
  console.timeEnd('run');
  process.exit(0)
}

run();
