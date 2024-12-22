import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }])], // name (định danh id) chỗ này k phải là field trong db
  controllers: [CompaniesController],
  providers: [CompaniesService]
})
export class CompaniesModule {}
