import { Module } from "@nestjs/common";
import { UserModuleBase } from "./base/user.module.base";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { DbService } from '../dbService/db.service'

@Module({
  imports: [UserModuleBase],
  controllers: [UserController],
  providers: [UserService , DbService],  // ✅ AJOUTÉ DbService
  exports: [UserService],
})
export class UserModule {}
