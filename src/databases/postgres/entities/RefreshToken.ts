import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'refresh_token' })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
