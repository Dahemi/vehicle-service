import { Module, forwardRef } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleResolver } from './vehicle.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { ImportModule } from 'src/import/import.module';
import { VehicleController } from './vehicle.controller';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';


@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    forwardRef(() => ImportModule),
    BullModule.registerQueue({
      name: 'vehicle-import',
    }),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  providers: [VehicleResolver, VehicleService],
  controllers:[VehicleController],
  exports: [VehicleService],
})
export class VehicleModule {}
