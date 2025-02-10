import {
  DynamicModule,
  Global,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import Sequelize, { ModelStatic } from '@sequelize/core';
import { IBMiDialect } from '@rcronin/sequelize-ibmi-mapepire';

const createModelProviders = (models: ModelStatic[]): any[] => {
  return models.map((model) => ({
    provide: model.name,
    useFactory: () => {
      return model;
    },
    inject: ['SEQUELIZE'],
  }));
};

@Global()
@Module({})
class SequelizeCoreModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  static forRoot(models?: ModelStatic[]) {
    const connectionProvider = {
      provide: 'SEQUELIZE',
      useFactory: async (configService: ConfigService) => {
        const sequelize = new Sequelize({
          dialect: IBMiDialect,
          host: configService.getOrThrow<string>('HOST'),
          user: configService.getOrThrow<string>('USERNAME'),
          password: configService.getOrThrow<string>('PASSWORD'),
          ignoreUnauthorized: true,
          pool: {
            max: 25,
          },
        });

        sequelize.addModels(models);

        return sequelize;
      },
      inject: [ConfigService],
    };

    const providers = createModelProviders(models);

    return {
      module: SequelizeCoreModule,
      providers: [connectionProvider, ...providers],
      exports: [connectionProvider, ...providers],
    };
  }

  async onApplicationShutdown() {
    const connection = this.moduleRef.get<Sequelize>('SEQUELIZE');
    connection && (await connection.close());
  }
}

@Module({})
export class SequelizeModule {
  static forRoot(models?: ModelStatic[]): DynamicModule {
    return {
      module: SequelizeModule,
      imports: [SequelizeCoreModule.forRoot(models)],
    };
  }
}
