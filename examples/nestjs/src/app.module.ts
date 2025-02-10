import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from './modules/sequelize.module';
import { DepartmentModel } from './models/department.model';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot([DepartmentModel]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
