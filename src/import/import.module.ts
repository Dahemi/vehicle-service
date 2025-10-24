import { Module, forwardRef } from '@nestjs/common';
import { ImportService } from './import.service';
import { BullModule } from '@nestjs/bull';
import { ImportVehicleProcessor } from './processors/import-vehicle.processor';
import { VehicleModule } from 'src/vehicle/vehicle.module';
import { ImportResolver } from './import.resolver';


@Module({
  imports: [
    // connects to the 'vehicle-import' queue
    BullModule.registerQueue({
      name: 'vehicle-import',
    }),
    forwardRef(() =>VehicleModule),
  ],
  providers: [ 
    ImportService, 
    ImportVehicleProcessor, 
    ImportResolver 
  ],
  exports: [ImportService],
})
export class ImportModule {}
