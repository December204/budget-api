import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'budget_limit' })
@Unique(['userId', 'categoryId', 'month', 'year'])
export class BudgetLimit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column()
  categoryId: number;

  @Column({ type: 'smallint' })
  month: number;

  @Column({ type: 'smallint' })
  year: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  limitAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
