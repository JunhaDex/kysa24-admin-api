import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from '@/resources/team/team.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  ref: string;
  @Column()
  name: string;
  @Column({ type: 'tinyint', unsigned: true })
  sex: number; // iso 5218 1: male 2: female
  @Column()
  age: number;
  @Column()
  dob: Date;
  @Column()
  nickname: string;
  @Column({ unique: true })
  authId: string;
  @Column()
  pwd: string;
  @Column()
  teamId: number;
  @Column()
  profileImg: string;
  @Column()
  coverImg: string;
  @Column()
  introduce: string;
  @Column()
  geo: string;
  @Column({})
  actStatus: number;
  @Column({ nullable: true })
  createdAt: Date;
  @Column({ nullable: true })
  updatedAt: Date;
  @OneToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;
}

@Entity({ name: 'user_info' })
export class UserExtra {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  userId: number;
  @Column({ type: 'simple-json', name: 'extra_info' })
  extraInfo: any;
  @Column()
  createdAt: Date;
}

@Entity({ name: 'status_user_act' })
export class StatusUserAct {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unsigned: true, unique: true })
  level: number;
  @Column()
  statusName: string;
  @Column()
  statusDesc: string;
}
