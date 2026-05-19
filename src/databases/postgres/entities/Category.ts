import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

import { TransactionType } from '@Enums/BudgetEnums';

import { User } from './User';
import { Transaction } from './Transaction';
import { BudgetLimit } from './BudgetLimit';
import { RecurringTransaction } from './RecurringTransaction';

@Entity({ name: 'categories' })
@Index(['userId'])
@Index(['userId', 'type'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ default: '#6B7280' })
  color: string;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Transaction, (tx) => tx.category)
  transactions: Transaction[];

  @OneToMany(() => BudgetLimit, (bl) => bl.category)
  budgetLimits: BudgetLimit[];

  @OneToMany(() => RecurringTransaction, (rt) => rt.category)
  recurringTransactions: RecurringTransaction[];
}
