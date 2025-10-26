import { Module, forwardRef } from '@nestjs/common';
import { ImportService } from './import.service';
import { BullModule } from '@nestjs/bull';
import { ImportResolver } from './import.resolver';


@Module({
  imports: [
    // connects to the 'vehicle-import' queue
    BullModule.registerQueue({
      name: 'vehicle-import',
    }),
    
  ],
  providers: [ 
    ImportService,  
    ImportResolver 
  ],
  exports: [ImportService],
})
export class ImportModule {}
