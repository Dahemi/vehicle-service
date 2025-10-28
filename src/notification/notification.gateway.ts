import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors:{
    origin: 'http://localhost:4200',
    credentials: true,
  }
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client Connected; ${client.id}`);
  }

  handleDisconnect(client: Socket){
    console.log(`Client Disconnected: ${client.id}`);
  } 

  emitExportComplete(data: {
    jobId: string;
    filename: string;
    recordCount: number;
    years: number;
  }){
    this.server.emit('export-completed',data);
    console.log(`Emit export-completed event for job: ${data.jobId}`);
  }

  emitExportFailure(data:{
    jobId: string;
    error: string;
  }){
    this.server.emit('export-failed',data);
    console.log(`Emit export-failed event for job: ${data.jobId}`);
  }

}
