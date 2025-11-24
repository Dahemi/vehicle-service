import { Processor, Process } from "@nestjs/bull";
import type { Job } from "bull";
import { VehicleService } from "../../vehicle/vehicle.service";
import { NotificationService } from "src/notification/notification.service";
import * as fs from 'fs';
import csvParser from 'csv-parser';

@Processor('vehicle-import')
export class ImportVehicleProcessor {

    constructor(
        private readonly vehicleService: VehicleService,
        private readonly notificationService: NotificationService // ✅ Inject notification service
    ) {}

    @Process('import-task')
    async handleImportJob(job: Job<{filePath: string}>) {
        try {
            console.log(`Processing file: ${job.data.filePath}`);
            const { filePath } = job.data;

            const isCSV = filePath.endsWith('.csv');
            if (!isCSV) throw new Error('Unsupported file format.');
            
            const recordCount = await this.parseCsv(filePath);
            
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);

            this.notificationService.notifyImportComplete({
                jobId: job.id.toString(),
                recordCount,
                filename: filePath.split(/[\\/]/).pop() || 'unknown',
            });

            return { status: 'done', file: filePath, recordCount };
        }catch (error) {
            this.notificationService.notifyImportFailure({
                jobId: job.id.toString(),
                error: error.message || 'Unknown error occurred',
            });
            throw error;
        }
    }

    private async parseCsv(filePath: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const vehicles: any[] = [];
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => vehicles.push(row))
                .on('end', async () => {
                    for (const row of vehicles) {
                        await this.saveVehicle(row);
                    }
                    resolve(vehicles.length); 
                })
                .on('error', reject);
        });
    }

    private async saveVehicle(row: any) {
        const vehicleData = {
            first_name: row.first_name || row['First Name'],
            last_name: row.last_name || row['Last Name'],
            email: row.email || row['Email'],
            car_make: row.car_make || row['Car Make'],
            car_model: row.car_model || row['Car Model'],
            vin: row.vin || row['VIN'],
            manufactured_date: row.manufactured_date || row['Manufactured Date'],
        };

        await this.vehicleService.create(vehicleData);
        console.log(`Saved vehicle: ${vehicleData.vin}`);
    }
}