# @rcronin/sequelize-ibmi-mapepire
IBM i (via Mapepire) Sequelize V7 Dialect

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/rcronin/sequelize-ibmi-mapepire/publish.yml)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/rcronin/sequelize-ibmi-mapepire)
![NPM Version](https://img.shields.io/npm/v/%40rcronin%2Fsequelize-ibmi-mapepire)
![NPM Downloads](https://img.shields.io/npm/dw/%40rcronin%2Fsequelize-ibmi-mapepire)

## Getting Started

### IBM i Prerequisites

#### Mapepire Server
[Documentation](https://mapepire-ibmi.github.io/guides/sysadmin/)

```yum install mapepire-server```

### Package Installation

```npm i @rcronin/sequelize-ibmi-mapepire```

Upon installation, the package will automatically install ```@ibm/mapepire-js```

## Usage

```ts
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

const sequelize = new Sequelize({
    dialect: IBMiDialect,
    host: process.env.HOST as string,
    user: process.env.USERNAME as string,
    password: process.env.PASSWORD as string,
    rejectUnauthorized: false, // false but need to validate certificate
    models: [DepartmentModel]
  });
```