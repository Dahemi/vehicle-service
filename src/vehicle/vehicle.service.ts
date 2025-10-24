import { Injectable } from '@nestjs/common';
import { CreateVehicleInput } from './dto/create-vehicle.input';
import { UpdateVehicleInput } from './dto/update-vehicle.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class VehicleService {

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ){}


  findAll(): Promise<Vehicle[]>{
    return this.vehicleRepository.find();
  }

  create(vehicleInput: CreateVehicleInput): Promise<Vehicle>{
    const newVehicle = this.vehicleRepository.create(vehicleInput);
    return this.vehicleRepository.save(newVehicle);
  }

  async update(id: string, vehicleInput: UpdateVehicleInput): Promise<Vehicle> {
    const existing = await this.vehicleRepository.findOneBy({ id });
    if (!existing) {
      return this.vehicleRepository.save({ ...vehicleInput, id });
    }
    Object.assign(existing, vehicleInput);
    return this.vehicleRepository.save(existing);
  }

  async delete(id: string): Promise<Vehicle> {
    const existing = await this.vehicleRepository.findOneBy({ id });
    if (!existing) {
      throw new Error('Vehicle not found');
    }
    const vehicleToReturn = { ...existing };
    await this.vehicleRepository.remove(existing);
    return vehicleToReturn as Vehicle;
  }
  
  // wildcard search on car_model
  async searchByModel(search:string): Promise<Vehicle[]> {
    
    // 1. Transform the input
    // const formattedSearch = search.replace('*', '%');

    // 2. Use TypeORM to search 
    return this.vehicleRepository.find({
      where:[
        { car_model: Like(`${search}%`) }
      ]
    })
  }

}
