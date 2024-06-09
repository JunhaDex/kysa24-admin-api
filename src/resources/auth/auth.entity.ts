import { Entity } from 'typeorm';

@Entity({ name: 'admin' })
export class Admin{
  @Column
  id: number;
  loginId: string;
  pwd: string;
  name: string;
  createdAt: Date;
}
