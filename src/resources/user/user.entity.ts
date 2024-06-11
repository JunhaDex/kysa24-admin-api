import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
}
