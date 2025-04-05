import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtServices: JwtService,
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers['authentication'] as string;
    let payload: JwtPayload;

    // verificar JWT
    try {
      payload = this.jwtServices.verify(token);
      await this.messageWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    // emitir un mensaje de todos los clientes conectados
    this.wss.emit('clients-updated', this.messageWsService.getOnlineClients());
  }

  handleDisconnect(client: Socket) {
    this.messageWsService.removeClient(client.id);

    // emitir un mensaje de todos los clientes conectados
    this.wss.emit('clients-updated', this.messageWsService.getOnlineClients());
  }

  // recibir un mensaje de un cliente
  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    /*
    // emitir el mensaje unicamente al cliente que lo envió
    client.emit('message-from-server', {
      fullName: `${client.id}`,
      message: payload.message || 'sin nombre',
    });
    */

    //! emitir el mensaje a todos los clientes conectados menos al que lo envió
    client.broadcast.emit('message-from-server', {
      fullName: `${this.messageWsService.getUserFullName(client.id)}`,
      message: payload.message || 'sin nombre',
    });

    /*
    // emitir el mensaje a todos los clientes conectados
    this.wss.emit('message-from-server', {
      fullName: `${client.id}`,
      message: payload.message || 'sin nombre',
    });*/
  }
}
