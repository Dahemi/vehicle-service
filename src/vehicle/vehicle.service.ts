import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateVehicleInput } from './dto/create-vehicle.input';
import { UpdateVehicleInput } from './dto/update-vehicle.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { LessThan, Like, Repository } from 'typeorm';

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);

  constructor(@InjectRepository(Vehicle) private vehicleRepository: Repository<Vehicle>){}

  async findAll(page: number, limit: number, sortBy?: string,search?: string): Promise<Vehicle[]>{
    
    const offset = (page -1) * limit;
    const queryOptions: any = {
      skip: offset,
      take: limit,
      order: {},
    };

    if (sortBy === 'manufactured_date' || !sortBy) {
      queryOptions.order.manufactured_date = 'ASC';
    }

    if (search) {
      queryOptions.where = {
        car_model: Like(`%${search}%`), 
      };
    }

    const vehicles = await this.vehicleRepository.find(queryOptions);
    return vehicles;
  }


  async create(vehicleInput: CreateVehicleInput): Promise<Vehicle>{
    const newVehicle = this.vehicleRepository.create(vehicleInput);
    const saved = await this.vehicleRepository.save(newVehicle);
    return saved;
  }


  async update(id: string, vehicleInput: UpdateVehicleInput): Promise<Vehicle> {
    const existing = await this.vehicleRepository.findOneBy({ id });

    if (!existing) {
      this.logger.warn(`Vehicle service: vehicle not found, creating new with ID: ${id}`);
      return this.vehicleRepository.save({ ...vehicleInput, id });
    }
    Object.assign(existing, vehicleInput);

    const updated = await this.vehicleRepository.save(existing);
    return updated;
  }


  async delete(id: string): Promise<Vehicle> {
    const existing = await this.vehicleRepository.findOneBy({ id });

    if (!existing) {
      this.logger.error(`Vehicle service: vehcile not found for deletion: ${id}`);
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    const vehicleToReturn = { ...existing };
    await this.vehicleRepository.remove(existing);
    return vehicleToReturn as Vehicle;
  }


  async findOlderThan(years: number): Promise<Vehicle[]> {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - years);

    const vehicles = await this.vehicleRepository.find({
      where: {
        manufactured_date: LessThan(cutoffDate.toISOString().split('T')[0]), // extracts date part only
      },
      order:{
        manufactured_date: 'ASC',
      }
    })

    return vehicles;
  }

  async findByVin(vin:string): Promise<Vehicle | null>{
    const vehicle = await this.vehicleRepository.findOneBy({vin});

    if (!vehicle) {
      this.logger.debug(`Vehcile service: No vehicle found with VIN: ${vin}`);
      return null;
    }

    return vehicle;
  }
  

}
