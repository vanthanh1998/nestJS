import { Controller, Get } from '@nestjs/common';

@Controller("/user") // route => "/user"
export class UserController {

  @Get() // => "/"
  findAll(): string {
    return "get all users"
  }

  @Get("thanhrain/by-id")
  findById(): string {
    return "find by id"
  }
}
