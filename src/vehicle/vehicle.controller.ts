import { Controller, Post,Get, Body,UseInterceptors, UploadedFile, BadRequestException, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { File as MulterFile } from 'multer';
import { extname, resolve } from 'path';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Controller('vehicles')
export class VehicleController {
  constructor(
    @InjectQueue('vehicle-import') private vehicleQueue: Queue,
    @InjectQueue('vehicle-export') private exportQueue: Queue,
  ) {}

  @Post('upload')
  @UseInterceptors( // handles file parsing
    FileInterceptor('file', { // use parsed file
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          // generate a unique identifier for the file
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          // calls callback with generated filename
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )


  /**
   * @UploadedFile()
   * extracts the uploaded file from the request
   */
  async uploadFile(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // adds job to the vehicle-import queue for background processing
    const job = await this.vehicleQueue.add('import-task', {
      filePath: resolve(file.path),
    });

    return {
      message: 'File uploaded successfully',
      jobId: job.id,
      status: 'queued',
    };
  }


  @Post('job-status/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {

    // retireive the job from the queue using the provided jobId
    const job = await this.vehicleQueue.getJob(jobId);
    
    if (!job) throw new BadRequestException('Job not found');

    const state = await job.getState();
    const progress = job.progress();

    return {
      jobId: job.id,
      status: state,
      progress,
      result: await job.finished().catch(() => null), // get the job result if completed
    };
  }

  @Post('export')
  async exportVehicles(@Body('years') years?:number) {
    const yearsToExport = years || 5;
    const job = await this.exportQueue.add('export-task', {years: yearsToExport});

    return {
      message: `Export job started for vehicles older than ${yearsToExport} years`,
      jobId: job.id,
      status: 'queued',
      years: yearsToExport,
    };
  }

  @Get('export-status/:jobId')
  async getExportJobStatus(@Param('jobId') jobId: string) {
    const job = await this.exportQueue.getJob(jobId);
    
    if (!job) throw new BadRequestException('Export job not found');

    const state = await job.getState();
    const progress = job.progress();
    const result = await job.finished().catch(() => null);
    

    return {
      jobId: job.id,
      status: state,
      progress,
      result
    };
  }
}