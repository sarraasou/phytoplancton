import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { SentryInterceptor, SentryModule } from "@ntegral/nestjs-sentry";
import { UserModule } from "./user/user.module";
import { CustomCacheInterceptor } from "./util/CustomCacheInterceptor/customCacheInterceptor";
import { ApolloDriver } from "@nestjs/apollo";
import { AppConfigModule } from "./appConfig/appConfig.module";
import { ProjectModule } from "./project/project.module";
import { ImageModule } from "./image/image.module";
import { AiModelModule } from "./aiModel/aiModel.module";
import { AnnotationModule } from "./annotation/annotation.module";
import { CollaboratorModule } from "./collaborator/collaborator.module";
import { ACLModule } from "./auth/acl.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { SecretsManagerModule } from "./providers/secrets/secretsManager.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ServeStaticOptionsService } from "./serveStaticOptions.service";
import { GraphQLModule } from "@nestjs/graphql";
import { RequestContextModule } from "nestjs-request-context";
import { CacheModule } from "@nestjs/cache-manager";
import { WinstonModule } from "nest-winston";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

@Module({
  controllers: [],
  imports: [
    UserModule,
    AppConfigModule,
    ProjectModule,
    ImageModule,
    AiModelModule,
    AnnotationModule,
    CollaboratorModule,
    ACLModule,
    AuthModule,
    HealthModule,
    SecretsManagerModule,
    RequestContextModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRootAsync({
      useClass: ServeStaticOptionsService,
    }),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
          filename: "/app/logger/application-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "14d",
        }),
      ],
    }),
    GraphQLModule.forRootAsync({
      useFactory: (configService) => {
        const playground = configService.get("GRAPHQL_PLAYGROUND");
        const introspection = configService.get("GRAPHQL_INTROSPECTION");
        return {
          autoSchemaFile: "schema.graphql",
          sortSchema: true,
          playground,
          introspection: playground || introspection,
        };
      },
      driver: ApolloDriver,
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    SentryModule.forRootAsync({
      useFactory: (configService) => {
        return {
          dsn: process.env.SENTRY_DSN,
        };
      },
      inject: [ConfigService],
      imports: [ConfigModule.forRoot()],
    }),
    CacheModule.register({
      isGlobal: true,
      max: 10000,
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new SentryInterceptor(),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomCacheInterceptor,
    },
  ],
})
export class AppModule {}
