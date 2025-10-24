import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class ImportService {

  // connects to the 'vehicle-import' queue
  constructor(@InjectQueue('vehicle-import') private importQueue: Queue) {}
  
  async queueVehicleImport(filePath: string): Promise<string> {
    const job = await this.importQueue.add('import-task', {
      filePath,
    });
    return `Import job ${job.id} queued`;
  }

  
}
