import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { VehicleModule } from 'src/vehicle/vehicle.module';
import { ImportVehicleProcessor } from './processors/import-vehicle.processor';
import { NotificationModule } from 'src/notification/notification.module'

@Module({
  imports: [
    // connects to the 'vehicle-import' queue
    BullModule.registerQueue({
      name: 'vehicle-import',
    }),
    forwardRef(() => VehicleModule),
    NotificationModule,
  ],
  providers: [ 
    ImportVehicleProcessor
  ],
})
export class ImportModule {}
