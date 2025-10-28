import { Processor, Process } from "@nestjs/bull";
import type { Job } from "bull";
import { VehicleService } from "src/vehicle/vehicle.service";
import * as fs from 'fs';
import * as path from 'path';
import { console } from "inspector";

@Processor('vehicle-export')
export class ExportVehicleProcessor{

    constructor(private readonly vehicleService: VehicleService) {}

    @Process('export-task')
    async handleExportJob(job:Job<{ years?: number}>){
        const years = job.data.years;
        console.log(`Starting export job with id: ${job.id}`);

        const vehicles = await this.vehicleService.findOlderThan(years || 5);

        if(vehicles.length == 0){
            console.log(`No vehicles found older than ${years} years for export.`);
            return {
                status: 'done',
                recordCount: 0,
                message : `No vehicles found older than ${years} years for export.`
            }
        }

        const csvContent = this.generateCSV(vehicles);

        const exportsDir = path.resolve('./exports');
        if (!fs.existsSync(exportsDir)){
            fs.mkdirSync(exportsDir);
        }

        const filename = `vehicles-export-${Date.now()}.csv`;
        const filePath = path.join(exportsDir, filename);

        fs.writeFileSync(filePath, csvContent);

        console.log(`Export job with id: ${job.id} completed.`);

        return {
            status: 'done',
            filePath,
            filename,
            recordCount: vehicles.length,
            years,
        };
    }

    private generateCSV(vehicles: any[]): string{

        const headers =[
            'ID',
            'First Name',
            'Last Name',
            'Email',
            'Car Make',
            'Car Model',
            'VIN',
            'Manufactured Date',
            'Age (Years)',
            'Created At'
        ];

        // Map database columns to CSV
        const rows = vehicles.map(vehicle => [
            vehicle.id,
            vehicle.first_name,
            vehicle.last_name,
            vehicle.email,
            vehicle.car_make,
            vehicle.car_model,
            vehicle.vin,
            vehicle.manufactured_date,
            vehicle.age_of_vehicle,
            vehicle.created_at
        ]);

        const csvLines =[
            headers.join(','),
            ...rows.map(row => row.map(field => `"${field}"`).join(','))
        ];

        return csvLines.join('\n');
    }
}