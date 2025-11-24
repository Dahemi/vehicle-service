import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {

    constructor(private readonly notificationGateway: NotificationGateway){}

    notifyExportComplete(data:{
        jobId: string;
        filename: string;
        recordCount: number;
        years: number;
    }){
        this.notificationGateway.emitExportComplete(data);
    }

    notifyExportFailure(data:{
        jobId: string;
        error: string;
    }){
        this.notificationGateway.emitExportFailure(data);
    }

    notifyImportComplete(data: {
        jobId: string;
        recordCount: number;
        filename: string;
    }){
        this.notificationGateway.emitImportComplete(data);
    }

    notifyImportFailure(data: {
        jobId: string;
        error: string;
    }){
        this.notificationGateway.emitImportFailure(data);
    }
}
