import { Module } from '@nestjs/common';
import { VehicleModule } from './vehicle/vehicle.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ImportModule } from './import/import.module';

@Module({
  imports: [
    VehicleModule,
    ImportModule,
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
    })
    /**
     * initializes Bull with your Redis instance.
     * You only do this once at the top level.
     * If later you deploy to Docker Compose, 
     * this host will change to the container name (e.g., redis).
     */
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
