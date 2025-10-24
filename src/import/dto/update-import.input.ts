import { CreateImportInput } from './import-vehicle.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateImportInput extends PartialType(CreateImportInput) {
  @Field(() => Int)
  id: number;
}
