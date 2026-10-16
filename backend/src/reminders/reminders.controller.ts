import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard, type AuthUser } from '../auth/jwt-auth.guard.js';
import { CreateReminderDto } from './dto/reminder.dto.js';
import { RemindersService } from './reminders.service.js';

@ApiTags('Напоминания о покупках')
@ApiCookieAuth()
@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly reminders: RemindersService) {}

  @Get()
  @ApiOperation({ summary: 'Список напоминаний' })
  list(@CurrentUser() user: AuthUser) {
    return this.reminders.list(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Отложить покупку — создать напоминание' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReminderDto) {
    return this.reminders.create(user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить напоминание' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.reminders.remove(user.id, id);
  }
}
