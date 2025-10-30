import { Injectable } from '@nestjs/common';
import { CreateVehicleInput } from './dto/create-vehicle.input';
import { UpdateVehicleInput } from './dto/update-vehicle.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { LessThan, Like, Repository } from 'typeorm';

@Injectable()
export class VehicleService {

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ){}


  findAll(
    page: number, 
    limit: number,
    sortBy?: string,
    search?: string
  ): Promise<Vehicle[]>{

    // how many records to skip
    const offset = (page -1) * limit;

    // Build query options
    const queryOptions: any = {
      skip: offset,
      take: limit,
      order: {},
    };

    // Apply sorting 
    if (sortBy === 'manufactured_date' || !sortBy) {
      queryOptions.order.manufactured_date = 'ASC';
    }

    // Apply search filter if provided
    if (search) {
      queryOptions.where = {
        car_model: Like(`%${search}%`), 
      };
    }

    return this.vehicleRepository.find(queryOptions);
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

  async findOlderThan(years: number): Promise<Vehicle[]> {
    const today = new Date();
    today.setFullYear(today.getFullYear() - years);

    return this.vehicleRepository.find({
      where: {
        manufactured_date: LessThan(today.toISOString().split('T')[0]), // extracts date part only
      },
      order:{
        manufactured_date: 'ASC',
      }
    })
  }

  async findById(id:string): Promise<Vehicle | null>{
    return this.vehicleRepository.findOneBy({id});
  }

  async findByVin(vin:string): Promise<Vehicle | null>{
    return this.vehicleRepository.findOneBy({vin});
  }
  

}
