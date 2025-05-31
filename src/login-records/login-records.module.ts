import { Module } from '@nestjs/common';
import { LoginRecordsService } from './login-records.service';
import { LoginRecordsController } from './login-records.controller';

@Module({
  controllers: [LoginRecordsController],
  providers: [LoginRecordsService],
  exports: [LoginRecordsService],
})
export class LoginRecordsModule {}
