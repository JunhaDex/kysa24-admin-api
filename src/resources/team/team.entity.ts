import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'team' })
export class Team {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  teamName: string;
  @Column()
  leader: number;
  @Column({ nullable: true })
  createdAt: Date;
  @Column({ nullable: true })
  updatedAt: Date;
}
