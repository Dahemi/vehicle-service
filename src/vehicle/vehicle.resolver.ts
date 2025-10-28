import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VehicleService } from './vehicle.service';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleInput } from './dto/create-vehicle.input';
import { UpdateVehicleInput } from './dto/update-vehicle.input';
import { ImportService } from 'src/import/import.service';

@Resolver(() => Vehicle)
export class VehicleResolver {
  constructor(
    private readonly vehicleService: VehicleService,
    private readonly importService: ImportService,
  ) {}
  

  @Query(() => [Vehicle], { name: 'findAllVehicles' })
  findAll(
    @Args('page',{type: () => Int, defaultValue:1}) page:number,
    @Args('limit',{type: () => Int, defaultValue:10}) limit:number,
    @Args('sortBy',{type:() => String, nullable: true}) sortBy?:string,
    @Args('search',{type:() => String, nullable: true}) search?:string,
  ): Promise<Vehicle[]> {
    return this.vehicleService.findAll(page, limit, sortBy, search);
  }

  @Mutation(() => Vehicle)
  createVehicle(@Args('createVehicleInput') createVehicleInput: CreateVehicleInput) {
    return this.vehicleService.create(createVehicleInput);
  }

  @Mutation(() => Vehicle)
  updateVehicle(@Args('updateVehicleInput') updateVehicleInput: UpdateVehicleInput) {
    return this.vehicleService.update(updateVehicleInput.id, updateVehicleInput);
  }

  @Mutation(() => Vehicle)
  async deleteVehicle(@Args('id') id: string) {
    return await this.vehicleService.delete(id);
  }

  /**
   * @Query(() => [Vehicle])
   * searchVehiclesByModel(@Args('search') search: string):Promise<Vehicle[]> {
      return this.vehicleService.searchByModel(search);
  }
   */
  

  @Mutation(() => String)
  async importVehicles(@Args('filePath') filePath: string):Promise<string> {
    const res = await this.importService.queueVehicleImport(filePath);
    return res;
  }
  
}
