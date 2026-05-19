import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TransactionType } from '@Enums/BudgetEnums';
import { User } from './User';
import { Category } from './Category';
import { RecurringTransaction } from './RecurringTransaction';

@Entity({ name: 'transactions' })
@Index(['userId'])
@Index(['userId', 'date'])
@Index(['userId', 'type'])
@Index(['categoryId'])
export class Transaction {
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

  @Column()
  date: Date;

  @Column({ nullable: true, type: 'varchar' })
  note: string | null;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true, type: 'uuid' })
  recurringTransactionId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.transactions)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => RecurringTransaction, (rt) => rt.transactions, { nullable: true })
  @JoinColumn({ name: 'recurringTransactionId' })
  recurringTransaction: RecurringTransaction | null;
}
