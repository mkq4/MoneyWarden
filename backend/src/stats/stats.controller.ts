import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Статистика')
@ApiCookieAuth()
@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Доходы, расходы и баланс за период + сравнение с прошлым',
  })
  summary(@CurrentUser() user: AuthUser, @Query() q: PeriodQueryDto) {
    return this.stats.summary(user.id, resolvePeriod(q));
  }

  @Get('categories')
  @ApiOperation({ summary: 'Суммы по категориям за период' })
  categories(@CurrentUser() user: AuthUser, @Query() q: CategoryStatsQueryDto) {
    return this.stats.byCategory(user.id, resolvePeriod(q), q);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Помесячная динамика' })
  monthly(@CurrentUser() user: AuthUser, @Query() q: MonthlyStatsQueryDto) {
    return this.stats.monthly(user.id, q);
  }

  @Get('months')
  @ApiOperation({
    summary: 'Месяцы, в которых есть операции (YYYY-MM, от новых к старым)',
  })
  months(@CurrentUser() user: AuthUser) {
    return this.stats.months(user.id);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Разбивка месяца по дням' })
  daily(@CurrentUser() user: AuthUser, @Query() q: DailyStatsQueryDto) {
    return this.stats.daily(user.id, q);
  }
}
