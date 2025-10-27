import { Module, forwardRef } from '@nestjs/common';
import { ImportService } from './import.service';
import { BullModule } from '@nestjs/bull';
import { ImportResolver } from './import.resolver';
import { VehicleModule } from 'src/vehicle/vehicle.module';
import { ImportVehicleProcessor } from './processors/import-vehicle.processor';


@Module({
  imports: [
    // connects to the 'vehicle-import' queue
    BullModule.registerQueue({
      name: 'vehicle-import',
    }),
    forwardRef(() => VehicleModule)
  ],
  providers: [ 
    ImportService,  
    ImportResolver,
    ImportVehicleProcessor
  ],
  exports: [ImportService],
})
export class ImportModule {}
