import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/resources/user/user.entity';

@Entity({ name: 'group' })
export class Group {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  ref: string;
  @Column()
  creator: number;
  @Column()
  groupName: string;
  @Column({ nullable: true })
  profileImg: string;
  @Column({ nullable: true })
  coverImg: string;
  @Column({ nullable: true })
  createdAt: Date;
  @Column({ nullable: true })
  updatedAt: Date;
  @OneToOne(() => User)
  @JoinColumn({ name: 'creator' })
  creatorUser: User;
}
