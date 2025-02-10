import { Inject, Injectable } from '@nestjs/common';
import { DepartmentModel } from './models/department.model';

@Injectable()
export class AppService {
  constructor(
    @Inject(DepartmentModel.name)
    private readonly departmentRepo: typeof DepartmentModel,
  ) {}
  async getHello() {
    const departments = await this.departmentRepo.findAll();
    return JSON.parse(JSON.stringify(departments));
  }
}
