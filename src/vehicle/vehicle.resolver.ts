import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VehicleService } from './vehicle.service';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleInput } from './dto/create-vehicle.input';
import { UpdateVehicleInput } from './dto/update-vehicle.input';
import { ResolveReference } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';

@Resolver(() => Vehicle)
export class VehicleResolver {
  private readonly logger = new Logger(VehicleResolver.name);

  constructor(private readonly vehicleService: VehicleService) {}

  @Query(() => [Vehicle], { name: 'findAllVehicles' })
  async findAll(
    @Args('page',{ type: () => Int, defaultValue:1}) page:number,
    @Args('limit',{ type: () => Int, defaultValue:10}) limit:number,
    @Args('sortBy',{ type:() => String, nullable: true}) sortBy?:string,
    @Args('search',{ type:() => String, nullable: true}) search?:string,
  ): Promise<Vehicle[]> {
    this.logger.log(`Vehicle service: findAllVehicles - Page: ${page}, Limit: ${limit}`);

    if (page < 1){
      this.logger.error('Vehicle service - Invalid page number');
      throw new Error('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100){
      this.logger.error('Vehicle service - Invalid limit');
      throw new Error('Limit must be betweeb 1 and 100');
    }

    const vehicles = await this.vehicleService.findAll(page, limit, sortBy, search);
    return vehicles;
  }


  @Query(() => Vehicle, { name: 'findVehicleByVIN', nullable: true })
  async findByVIN(@Args('vin') vin: string): Promise<Vehicle | null> {
    this.logger.log(`Vehicle service: findVehicleByVIN - VIN: ${vin}`);

    if(!vin || vin.trim().length === 0){
      this.logger.error('Vehicle service - Empty VIN provided');
      throw new Error('VIN cannot be empty');
    }

    const vehicle = await this.vehicleService.findByVin(vin);

    if (!vehicle){
      this.logger.warn(`Vehicle service - vehicle not found for VIN: ${vin}`);
      return null;
    }

    return vehicle;
  }


  @Mutation(() => Vehicle)
  async createVehicle(@Args('createVehicleInput') createVehicleInput: CreateVehicleInput) {
    this.logger.log(`Vehicle service: createVehicle - Input: ${JSON.stringify(createVehicleInput)}`);

    if (!createVehicleInput.vin || createVehicleInput.vin.trim().length === 0){
      this.logger.error('Vehicle service - VIN is required for creating a vehicle');
      throw new Error('VIN is required');
    }

    const existing = await this.vehicleService.findByVin(createVehicleInput.vin);
    if (existing){
      this.logger.error(`Vehicle service - Duplicate VIN: ${createVehicleInput.vin}`);
      throw new Error('Vehicle with this VIN already exists');
    }

    const vehicle = await this.vehicleService.create(createVehicleInput);
    return vehicle;
  }


  @Mutation(() => Vehicle)
  async updateVehicle(@Args('updateVehicleInput') updateVehicleInput: UpdateVehicleInput) {
    this.logger.log(`Vehicle service: updateVehicle - Input: ${JSON.stringify(updateVehicleInput)}`);

    if (!updateVehicleInput.id || updateVehicleInput.id.trim().length === 0){
      this.logger.error('Vehicle service - ID is required for update');
      throw new Error('ID is required for update');
    }

    const vehicle = await this.vehicleService.update(updateVehicleInput.id, updateVehicleInput);
    return vehicle;
  }


  @Mutation(() => Vehicle)
  async deleteVehicle(@Args('id') id: string) {
    this.logger.log(`Vehicle service: deleteVehicle - ID: ${id}`);

    if (!id){
      this.logger.error('Vehicle service - ID is required for deletion');
      throw new Error('ID is required for deletion');
    }

    const vehicle = await this.vehicleService.delete(id);
    return vehicle;
  }

 
  @ResolveReference()
  async resolveReference(reference:{ __typename: string; vin: string; }) {
    this.logger.log('Federation: ResolveReference called by gateway');
    this.logger.log(`Federation: Resolving Vehicle entity VIN ${reference.vin}`);

    if (reference.vin){
      this.logger.error('Federation: No VIN provided in reference');
      throw new Error('VIN required for entity resolution');
    }

    const vehicle = await this.vehicleService.findByVin(reference.vin);
    return vehicle;
  }
}
