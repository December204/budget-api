import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { TransactionType } from '@Enums/TransactionType';

@Entity({ name: 'transaction' })
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column({ nullable: true, type: 'int' })
  categoryId: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  description: string | null;

  @Column({ nullable: true, type: 'varchar', length: 1000 })
  note: string | null;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
