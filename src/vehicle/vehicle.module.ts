import { Module, forwardRef } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleResolver } from './vehicle.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { ImportModule } from 'src/import/import.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    forwardRef(() => ImportModule),
  ],
  providers: [VehicleResolver, VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
