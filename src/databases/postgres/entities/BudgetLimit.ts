import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';

import { User } from './User';
import { Category } from './Category';

@Entity({ name: 'budget_limits' })
@Unique(['userId', 'categoryId', 'month', 'year'])
@Index(['userId', 'year', 'month'])
export class BudgetLimit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  categoryId: string;

  @Column({ type: 'int' })
  limitAmount: number; // monthly cap in VND

  @Column({ type: 'int' })
  month: number; // 1-12

  @Column({ type: 'int' })
  year: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.budgetLimits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.budgetLimits)
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
