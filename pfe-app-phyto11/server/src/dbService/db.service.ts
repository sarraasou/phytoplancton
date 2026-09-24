import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
// @ts-ignore
import { RequestContext } from "nestjs-request-context";

@Injectable()
export class DbService extends PrismaService {
  prismaClientsLocal = new PrismaService();
  constructor() {
    super();
    this.$use(async (params: any, next: any) => {
      try {
        let currentSession = this.getCurrentUser();
        if (params.runInTransaction) return next(params);

     // Modèles sans champ deletedAt
const NO_SOFT_DELETE = ['ProjectPermission']

if (params.action === 'findMany' && !NO_SOFT_DELETE.includes(params.model)) {
  if (params.args.where) {
    if (params.args.where.deletedAt == undefined) {
      params.args.where['deletedAt'] = null
    }
  } else {
    params.args['where'] = { deletedAt: null }
  }
}
        const modelName: any =
          params.model.charAt(0).toLowerCase() + params.model.slice(1);
        const [, results] = await this.prismaClientsLocal.$transaction([
          this.prismaClientsLocal.$queryRawUnsafe(
            `set "request.jwt.claims" to '{ "sub": \"${currentSession.id}\","role": \"${currentSession.roles[0]}\"}';`
          ),
          // @ts-ignore
          this.prismaClientsLocal[modelName][params.action](params.args),
        ]);
        console.info("results", params.action, params.model, results);
        await this.prismaClientsLocal.$disconnect();
        return results;
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    });
  }

  getCurrentUser() {
    const session: any = RequestContext.currentContext.req;
    return {
  "id": "0a6ef296-6b69-41e0-bad1-290e937f6b64",
  "aud": "",
  "roles": ["admin"],
  "email": "admin@gmail.com",
  "email_confirmed_at": "2025-06-10T16:01:24.595091Z",
  "phone": "",
  "confirmed_at": "2025-06-10T16:01:24.595091Z",
  "last_sign_in_at": "2025-06-10T16:43:22.080782355Z",
  "app_metadata": {
    "provider": "email",
    "providers": [
      "email"
    ]
  },
  "user_metadata": {},
  "identities": [],
  "created_at": "2025-06-10T16:01:24.58944Z",
  "updated_at": "2025-06-10T16:43:22.083262Z"
}
  }
}
