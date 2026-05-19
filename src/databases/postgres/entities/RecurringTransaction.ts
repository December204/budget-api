import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

import { TransactionType } from '@Enums/BudgetEnums';

import { User } from './User';
import { Category } from './Category';
import { Transaction } from './Transaction';

@Entity({ name: 'recurring_transactions' })
@Index(['userId'])
@Index(['userId', 'isActive'])
export class RecurringTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  categoryId: string;

  @Column({ type: 'int' })
  amount: number; // VND, always positive

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'int', nullable: true })
  dayOfMonth: number | null; // 1-31

  @Column({ nullable: true, type: 'varchar' })
  note: string | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.recurringTransactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.recurringTransactions)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => Transaction, (tx) => tx.recurringTransaction)
  transactions: Transaction[];
}
