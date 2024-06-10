import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'admin' })
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  loginId: string;
  @Column()
  pwd: string;
  @Column()
  name: string;
  @Column({ nullable: true })
  createdAt: Date;
}
