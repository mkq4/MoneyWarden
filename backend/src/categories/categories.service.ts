import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Category, TransactionType } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateCategoryDto,
  ListCategoriesQueryDto,
  UpdateCategoryDto,
} from './dto/category.dto.js';

const FALLBACK_NAME = 'другое';
const isFallback = (c: Category) => c.name.toLowerCase() === FALLBACK_NAME;

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Порядок: по типу, затем по дате создания, но «Другое» всегда в конце
   * своего типа — новые категории встают перед ним.
   */
  async list(userId: number, query: ListCategoriesQueryDto) {
    const categories = await this.prisma.category.findMany({
      where: {
        userId,
        type: query.type,
        archivedAt: query.includeArchived ? undefined : null,
      },
      orderBy: [{ type: 'asc' }, { id: 'asc' }],
    });
    return categories.sort(
      (a, b) =>
        a.type.localeCompare(b.type) ||
        Number(isFallback(a)) - Number(isFallback(b)),
    );
  }

  async create(userId: number, dto: CreateCategoryDto) {
    await this.ensureNameFree(userId, dto.type, dto.name);
    const { name, type, color, icon } = dto;
    return this.prisma.category.create({
      data: { name, type, color, icon, userId },
    });
  }

  async update(userId: number, id: number, dto: UpdateCategoryDto) {
    const category = await this.findOwned(userId, id);
    const { archived, ...fields } = dto;
    const willBeActive =
      archived === undefined ? !category.archivedAt : !archived;
    if (willBeActive && (fields.name || category.archivedAt)) {
      await this.ensureNameFree(
        userId,
        category.type,
        fields.name ?? category.name,
        id,
      );
    }
    return this.prisma.category.update({
      where: { id },
      data: {
        ...fields,
        ...(archived !== undefined && {
          archivedAt: archived ? (category.archivedAt ?? new Date()) : null,
        }),
      },
    });
  }

  /**
   * Категорию с операциями только архивируем — история и статистика
   * должны остаться целыми. Пустую удаляем физически.
   */
  async remove(userId: number, id: number) {
    await this.findOwned(userId, id);
    const used = await this.prisma.transaction.count({
      where: { categoryId: id },
    });
    if (used > 0) {
      await this.prisma.category.update({
        where: { id },
        data: { archivedAt: new Date() },
      });
      return { archived: true };
    }
    await this.prisma.category.delete({ where: { id } });
    return { deleted: true };
  }

  async findOwned(userId: number, id: number): Promise<Category> {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException('Категория не найдена');
    return category;
  }

  /** Категория, в которую можно записать новую операцию. */
  async findUsable(userId: number, id: number): Promise<Category> {
    const category = await this.findOwned(userId, id);
    if (category.archivedAt) {
      throw new BadRequestException('Категория в архиве');
    }
    return category;
  }

  private async ensureNameFree(
    userId: number,
    type: TransactionType,
    name: string,
    exceptId?: number,
  ) {
    const clash = await this.prisma.category.findFirst({
      where: {
        userId,
        type,
        archivedAt: null,
        name: { equals: name, mode: 'insensitive' },
        id: exceptId ? { not: exceptId } : undefined,
      },
    });
    if (clash) throw new ConflictException('Категория с таким именем уже есть');
  }
}
