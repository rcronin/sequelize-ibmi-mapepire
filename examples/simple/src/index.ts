import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from '@sequelize/core';
import { Attribute, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { IBMiDialect } from '@rcronin/sequelize-ibmi-mapepire';
import 'dotenv/config'

@Table({
  freezeTableName: true,
  timestamps: false,
  tableName: 'DEPARTMENT', // whatever the actual IBM i table is called
  schema: 'SAMPLE' // whatever the actual IBM i schema is called
})
export class DepartmentModel extends Model<InferAttributes<DepartmentModel>, InferCreationAttributes<DepartmentModel>> {
  @Attribute({
    type: DataTypes.STRING,
    columnName: 'DEPTNO'
  })
  @PrimaryKey()
  declare number: string;

  @Attribute({
    type: DataTypes.STRING,
    columnName: 'DEPTNAME'
  })
  declare name: string;

  @Attribute({
    type: DataTypes.STRING,
    columnName: 'MGRNO'
  })
  declare managerNumber: string;

  @Attribute({
    type: DataTypes.STRING,
    columnName: 'ADMRDEPT'
  })
  declare parent: string;

  @Attribute({
    type: DataTypes.STRING,
    columnName: 'LOCATION'
  })
  declare location: string;
}

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

