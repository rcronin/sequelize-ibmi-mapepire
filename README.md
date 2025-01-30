# @rcronin/sequelize-ibmi-mapepire
IBM i (via Mapepire) Sequelize V7 Dialect

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/rcronin/sequelize-ibmi-mapepire/publish.yml)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/rcronin/sequelize-ibmi-mapepire)
![NPM Version](https://img.shields.io/npm/v/%40rcronin%2Fsequelize-ibmi-mapepire)
![NPM Downloads](https://img.shields.io/npm/dw/%40rcronin%2Fsequelize-ibmi-mapepire)

## Getting Started

### Prerequisites

#### Service Commander
[Github Repository](https://github.com/ThePrez/ServiceCommander-IBMi)

```yum install service-commander```

#### Mapepire Server
[Documentation](https://mapepire-ibmi.github.io/guides/sysadmin/)

```yum install mapepire-server```

### Package Installation

```npm i @rcronin/sequelize-ibmi-mapepire```

Upon installation, the package will automatically install ```@ibm/mapepire-js```

## Usage

```ts
import { Sequelize } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Table } from '@sequelize/core/decorators-legacy';
import { IbmiDialect } from '@rcronin/sequelize-ibm-mapepire';

@Table({
  freezeTableName: true,
  timestamps: false,
  tableName: 'USER', // whatever the actual IBM i table is called
  schema: 'SCHEMA_NAME' // whatever the actual IBM i schema is called
})
export class UserModel extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare firstName: string;

  @Attribute(DataTypes.STRING)
  declare lastName: string;

  @Attribute(DataTypes.DATEONLY)
  declare dateOfBirth: string;
}

const sequelize = new Sequelize({
  dialect: IBMiDialect,
  host: env.HOST,
  user: env.USER,
  password: env.PASSWORD,
  ignoreUnauthorized: true, // false but need to validate certificate
  models: [UserModel]
});
```