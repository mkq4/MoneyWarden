import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard, type AuthUser } from '../auth/jwt-auth.guard.js';
import { PeriodQueryDto } from '../common/period-query.dto.js';
import { resolvePeriod } from '../common/period.js';
import {
  CategoryStatsQueryDto,
  DailyStatsQueryDto,
  MonthlyStatsQueryDto,
} from './dto/stats-query.dto.js';
import { StatsService } from './stats.service.js';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('summary')
  summary(@CurrentUser() user: AuthUser, @Query() q: PeriodQueryDto) {
    return this.stats.summary(user.id, resolvePeriod(q));
  }

  @Get('categories')
  categories(@CurrentUser() user: AuthUser, @Query() q: CategoryStatsQueryDto) {
    return this.stats.byCategory(user.id, resolvePeriod(q), q);
  }

  @Get('monthly')
  monthly(@CurrentUser() user: AuthUser, @Query() q: MonthlyStatsQueryDto) {
    return this.stats.monthly(user.id, q);
  }

  @Get('daily')
  daily(@CurrentUser() user: AuthUser, @Query() q: DailyStatsQueryDto) {
    return this.stats.daily(user.id, q);
  }
}
