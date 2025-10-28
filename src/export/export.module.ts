import { forwardRef, Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportResolver } from './export.resolver';
import { BullModule } from '@nestjs/bull';
import { VehicleModule } from 'src/vehicle/vehicle.module';
import { ExportVehicleProcessor } from './processors/export-service.processor';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports:[
    BullModule.registerQueue({
      name: 'vehicle-export',
    }),
    forwardRef(() => VehicleModule),
    NotificationModule
  ],
  providers: [ExportResolver, ExportService, ExportVehicleProcessor],
  exports:[BullModule, ExportService]
})
export class ExportModule {}
