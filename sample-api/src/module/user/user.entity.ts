import { IsEmail } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number

  @Column()
  @Index({ unique: true })
  @IsEmail()
  email!: string

  @Column()
  password!: string

  @CreateDateColumn()
  readonly createdAt?: Date

  @UpdateDateColumn()
  readonly updatedAt?: Date
}
