import { Processor, Process } from "@nestjs/bull";
import type { Job } from "bull";
import { VehicleService } from "src/vehicle/vehicle.service";
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import csvParser from 'csv-parser';

@Processor('vehicle-import') // listen to this queue
export class ImportVehicleProcessor{

    constructor(private readonly vehicleService: VehicleService) {}

    @Process('import-task')// job type
    async handleImportJob(job: Job<{filePath:string}>){

        console.log(`Processing file: ${job.data.filePath}`);
        const { filePath} = job.data;

        const isExcel = filePath.endsWith('.xlsx') || filePath.endsWith('.xls');
        const isCSV = filePath.endsWith('.csv');

        if(isExcel){
            await this.parseExcel(filePath);
        }else if(isCSV){
            await this.parseCsv(filePath);
        }else{
            throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
        }

        return { status: 'done', file: filePath};

    }

    
    private async parseExcel(filePath: string) {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        for (const row of data) {
            await this.saveVehicle(row);
        }
    }

    private async parseCsv(filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const vehicles: any[] = [];
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => vehicles.push(row))
                .on('end', async () => {
                    for (const row of vehicles) {
                        await this.saveVehicle(row);
                    }
                    resolve();
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