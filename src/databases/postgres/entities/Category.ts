import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { CategoryType } from '@Enums/CategoryType';

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ nullable: true, type: 'varchar' })
  color: string | null;

  @Column({ type: 'enum', enum: CategoryType })
  type: CategoryType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
