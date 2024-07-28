import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Post {
  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
    // createdAt and updatedAt will be handled by TypeORM
  }

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt!: Date;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt!: Date;

  @Column()
  public title: string;

  @Column()
  public content: string;
}
