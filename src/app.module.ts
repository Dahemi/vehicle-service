import { Module } from '@nestjs/common';
import { VehicleModule } from './vehicle/vehicle.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ImportModule } from './import/import.module';
import { ExportModule } from './export/export.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    VehicleModule,
    ImportModule,
    ExportModule,
    NotificationModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver:ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql-schema.gql')
    }),
    TypeOrmModule.forRoot({
      type:'postgres',
      host:'localhost',
      port:5432,
      username: 'postgres',
      password: 'dahami123',
      database:'vehicles',
      entities: ["dist/**/*.entity{.ts,.js}"],
      synchronize:true,
    }),
    BullModule.forRoot({
      redis:{
        host:'localhost',
        port:6379
      }
    }),
    NotificationModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
