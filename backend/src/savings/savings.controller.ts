import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard, type AuthUser } from '../auth/jwt-auth.guard.js';
import { SetBalanceDto } from './dto/set-balance.dto.js';
import { SavingsService } from './savings.service.js';

@Controller('savings')
@UseGuards(JwtAuthGuard)
export class SavingsController {
  constructor(private readonly savings: SavingsService) {}

  @Get()
  async get(@CurrentUser() user: AuthUser) {
    return { total: await this.savings.getTotal(user.id) };
  }

  @Put('balance')
  setBalance(@CurrentUser() user: AuthUser, @Body() dto: SetBalanceDto) {
    return this.savings.setBalance(user.id, dto.targetAmount);
  }
}
