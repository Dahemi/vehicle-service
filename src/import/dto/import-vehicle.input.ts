import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateImportInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
