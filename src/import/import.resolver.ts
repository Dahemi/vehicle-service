import {Resolver, Query, Args, Mutation} from '@nestjs/graphql';
import {ImportService} from './import.service';

@Resolver()
export class ImportResolver {
    constructor(private readonly importService: ImportService) {}

    @Mutation(() => String)
    async importVehicles(
        @Args('filePath') filePath: string,
    ): Promise<string> {
        return this.importService.queueVehicleImport(filePath);
    }
}