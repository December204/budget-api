import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

import { RefreshToken } from './RefreshToken';
import { Category } from './Category';
import { Transaction } from './Transaction';
import { BudgetLimit } from './BudgetLimit';
import { RecurringTransaction } from './RecurringTransaction';
import { Notification } from './Notification';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true, type: 'varchar' })
  name: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Transaction, (tx) => tx.user)
  transactions: Transaction[];

  @OneToMany(() => BudgetLimit, (bl) => bl.user)
  budgetLimits: BudgetLimit[];

  @OneToMany(() => RecurringTransaction, (rt) => rt.user)
  recurringTransactions: RecurringTransaction[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications: Notification[];
}
