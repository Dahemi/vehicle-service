import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateVehicleInput {
  
    @Field()
    first_name:string;
  
    @Field()
    last_name:string;
  
    @Field()
    email:string;
  
    @Field()
    car_make:string;
  
    @Field()
    car_model:string;
  
    @Field()
    vin:string;
  
    @Field()
    manufactured_date:string;
  
}
