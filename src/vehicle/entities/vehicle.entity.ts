import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Entity } from 'typeorm';
import { differenceInYears } from 'date-fns';

@ObjectType()
@Entity()
export class Vehicle {
  
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id:string;

  @Field()
  @Column()
  first_name:string;

  @Field()
  @Column()
  last_name:string;

  @Field()
  @Column({unique:false})
  email:string;

  @Field()
  @Column()
  car_make:string;

  @Field()
  @Column()
  car_model:string;

  @Field()
  @Column()
  vin:string;

  @Field()
  @Column()
  manufactured_date:string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  age_of_vehicle:number;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  calculateAge(){
    const manufactured = new Date(this.manufactured_date);
    const today = new Date();
    const age = differenceInYears(today, manufactured);
    this.age_of_vehicle = age;
  }
}
