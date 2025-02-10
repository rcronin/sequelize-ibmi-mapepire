import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from '@sequelize/core';
import {
  Attribute,
  PrimaryKey,
  Table,
} from '@sequelize/core/decorators-legacy';

@Table({
  freezeTableName: true,
  timestamps: false,
  tableName: 'DEPARTMENT', // whatever the actual IBM i table is called
  schema: 'SAMPLE', // whatever the actual IBM i schema is called
})
export class DepartmentModel extends Model<
  InferAttributes<DepartmentModel>,
  InferCreationAttributes<DepartmentModel>
> {
  @Attribute({
    type: DataTypes.STRING,
    columnName: 'DEPTNO',
  })
  @PrimaryKey()
  declare number: string;

  @Attribute({
    type: DataTypes.STRING,
    columnName: 'DEPTNAME',
  })
  declare name: string;

  @Attribute({
    type: DataTypes.STRING,
    columnName: 'MGRNO',
  })
  declare managerNumber: string;

  @Attribute({
    type: DataTypes.STRING,
    columnName: 'ADMRDEPT',
  })
  declare parent: string;

  @Attribute({
    type: DataTypes.STRING,
    columnName: 'LOCATION',
  })
  declare location: string;
}
