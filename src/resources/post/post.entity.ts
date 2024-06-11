import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/resources/user/user.entity';

@Entity({ name: 'post' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  author: number;
  @Column({ nullable: true })
  image: string;
  @Column({ type: 'text' })
  message: string;
  @Column()
  groupId: number;
  @Column({ nullable: true })
  createdAt: Date;
  @Column({ nullable: true })
  updatedAt: Date;
  @OneToOne(() => User)
  @JoinColumn({ name: 'author' })
  authorUser: User;
}
