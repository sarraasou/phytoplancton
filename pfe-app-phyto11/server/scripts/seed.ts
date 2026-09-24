import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { addAdmin } from "./addAdmin";
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

if (require.main === module) {
  dotenv.config();

  seed().catch((error) => {
    console.error(error);
    Sentry.captureException(error);
    Sentry.close(2000).then(function () {
      process.exit(1);
    });
  });
}

async function seed() {
  console.info("Seeding database...");
  const client = new PrismaClient();

  // 1. S'assurer que le schéma auth existe
  console.info("Ensuring auth schema exists...");
  await client.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS auth;`);

  // --- AJOUT POUR FIXER L'ERREUR AUTHENTICATOR ---
  console.info("Ensuring internal roles exist...");
  await client.$executeRawUnsafe(`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
        CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'postgres';
      END IF;
    END $$;
  `);
  // ----------------------------------------------

  // 2. Création de la fonction uid() pour Prisma
  await client.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid 
    AS 'SELECT null::uuid;' 
    LANGUAGE sql STABLE;
  `);

  // 3. Création des tables minimales pour auth
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS auth.users (
      id uuid NOT NULL PRIMARY KEY,
      email text,
      invited_at timestamptz,
      created_at timestamptz,
      updated_at timestamptz,
      last_sign_in_at timestamptz,
      raw_app_meta_data jsonb,
      raw_user_meta_data jsonb,
      role text
    );
  `);

  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
      id bigserial PRIMARY KEY,
      token varchar(255),
      user_id uuid
    );
  `);

  // --- RESTE DU SCRIPT D'ORIGINE ---
  
  const queryAddRoleAdmin = "DO\n $do$\n BEGIN\n IF NOT EXISTS (\n SELECT FROM pg_catalog.pg_roles\n WHERE rolname = 'admin') THEN\n CREATE ROLE \"admin\";\n END IF;\n END\n $do$;";
  await client.$queryRawUnsafe(queryAddRoleAdmin);

  await client.$queryRawUnsafe('GRANT USAGE ON SCHEMA public TO "admin"');
  await client.$queryRawUnsafe('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public to "admin"');
  await client.$queryRawUnsafe('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "admin"');

  const queryAddRoleUser = "DO\n $do$\n BEGIN\n IF NOT EXISTS (\n SELECT FROM pg_catalog.pg_roles\n WHERE rolname = 'user') THEN\n CREATE ROLE \"user\";\n END IF;\n END\n $do$;";
  await client.$queryRawUnsafe(queryAddRoleUser);

  await client.$queryRawUnsafe('GRANT USAGE ON SCHEMA public TO "user"');
  await client.$queryRawUnsafe('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public to "user"');
  await client.$queryRawUnsafe('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "user"');

  await client.$queryRawUnsafe('alter table public."User" enable row level security');

  const queryAddRoleAdvancedUser = "DO\n $do$\n BEGIN\n IF NOT EXISTS (\n SELECT FROM pg_catalog.pg_roles\n WHERE rolname = 'advanced_user_role') THEN\n CREATE ROLE \"advanced_user_role\";\n END IF;\n END\n $do$;";
  await client.$queryRawUnsafe(queryAddRoleAdvancedUser);

  await client.$queryRawUnsafe('GRANT USAGE ON SCHEMA public TO "advanced_user_role"');
  await client.$queryRawUnsafe('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public to "advanced_user_role"');
  await client.$queryRawUnsafe('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "advanced_user_role"');

  await client.$queryRawUnsafe('alter table public."User" enable row level security');

  const queryAddRoleBasicUser = "DO\n $do$\n BEGIN\n IF NOT EXISTS (\n SELECT FROM pg_catalog.pg_roles\n WHERE rolname = 'basic_user_role') THEN\n CREATE ROLE \"basic_user_role\";\n END IF;\n END\n $do$;";
  await client.$queryRawUnsafe(queryAddRoleBasicUser);

  const queryPolicySelect = "DO $do$ BEGIN IF NOT EXISTS ( SELECT FROM pg_catalog.pg_policies WHERE policyname = 'Public users are viewable by everyone.') THEN create policy \"Public users are viewable by everyone.\" on public.\"User\" for select using ( true ); END IF; END $do$; ";
  await client.$queryRawUnsafe(queryPolicySelect);

  const queryPolicyInsert = "DO $do$ BEGIN IF NOT EXISTS ( SELECT FROM pg_catalog.pg_policies WHERE policyname = 'Users can insert their own users.') THEN create policy \"Users can insert their own users.\" on public.\"User\" for insert with check ( auth.uid()::text = id ); END IF; END $do$; ";
  await client.$queryRawUnsafe(queryPolicyInsert);

  const queryPolicyUpdate = "DO $do$ BEGIN IF NOT EXISTS ( SELECT FROM pg_catalog.pg_policies WHERE policyname = 'Users can update own users or update invited not valid users') THEN create policy \"Users can update own users or update invited not valid users\" on public.\"User\" for update using (((select invited_at from auth.users as au where au.id::text = \"User\".id and \"User\".\"isValid\" = false) is not null ) OR (auth.uid()::text = id)); END IF; END $do$; ";
  await client.$queryRawUnsafe(queryPolicyUpdate);

  const queryPolicySelectId = "DO $do$ BEGIN IF NOT EXISTS ( SELECT FROM pg_catalog.pg_policies WHERE policyname = 'Users are viewable by users who created them.') THEN create policy \"Users are viewable by users who created them.\" on public.\"User\" for select using ( auth.uid()::text = id ); END IF; END $do$; ";
  await client.$queryRawUnsafe(queryPolicySelectId);

  const queryFunctionAddUser = 'CREATE OR REPLACE FUNCTION public.handle_new_user()\n RETURNS trigger\n LANGUAGE \'plpgsql\'\n COST 100\n VOLATILE NOT LEAKPROOF SECURITY DEFINER\n SET search_path=public\nAS $$\n begin\n IF (new.raw_app_meta_data->>\'provider\' = \'email\') then\n IF (((new.invited_at is not null) and (old.last_sign_in_at is null))) then\n insert into public."User" (id,"createdAt","updatedAt",username,roles, "firstName", "lastName")\n values (new.id::text,new.created_at,new.updated_at,new.email,ARRAY[new.role], new.raw_user_meta_data->>\'firstName\', new.raw_user_meta_data->>\'lastName\')\n ON CONFLICT (id)\n DO\n UPDATE SET "createdAt" = new.created_at,"updatedAt" = new.updated_at,username = new.email,roles = ARRAY[new.role], "firstName" = new.raw_user_meta_data->>\'firstName\',"lastName" = new.raw_user_meta_data->>\'lastName\';\n ELSE\n insert into public."User" (id,"createdAt","updatedAt",username,roles, "firstName", "lastName")\n values (new.id::text,new.created_at,new.updated_at,new.email, ARRAY[new.role], new.raw_user_meta_data->>\'firstName\', new.raw_user_meta_data->>\'lastName\')\n ON CONFLICT (id)\n DO\n UPDATE SET "createdAt" = new.created_at,"updatedAt" = new.updated_at,username = new.email ,roles = ARRAY[new.role], "firstName" = new.raw_user_meta_data->>\'firstName\',"lastName" = new.raw_user_meta_data->>\'lastName\';\n END IF;\n ELSE \n IF new.role = \'authenticated\' \n THEN\n UPDATE auth.users SET role=\'user\' WHERE id = new.id;\n new.role := \'user\';\n RETURN NEW;\n END IF;\n insert into public."User" (id,"createdAt","updatedAt","firstName","lastName", username,roles)\n values (new.id::text,new.created_at,new.updated_at,new.raw_user_meta_data->>\'firstName\',new.raw_user_meta_data->>\'lastName\',new.email,ARRAY[new.role])\n ON CONFLICT (id)\n DO UPDATE SET "createdAt" = new.created_at,"updatedAt" = new.updated_at, "firstName" = new.raw_user_meta_data->>\'firstName\', "lastName" = new.raw_user_meta_data->>\'lastName\', username = new.email, roles = ARRAY[new.role];\n END IF;\n return new;\n end $$;';
  await client.$queryRawUnsafe(queryFunctionAddUser);

  const queryFunctionDeleteUser = "create or replace function public.handle_delete_user() returns trigger language plpgsql security definer set search_path = public as $$ begin delete from public.\"User\" where id = old.id::text; return old; end; $$; ";
  await client.$queryRawUnsafe(queryFunctionDeleteUser);

  const queryTriggerAddUser = "create or replace trigger on_auth_user_created after insert or update on auth.users for each row execute procedure public.handle_new_user() ";
  await client.$queryRawUnsafe(queryTriggerAddUser);

  const queryTriggerDeleteUser = "create or replace trigger on_auth_user_deleted after delete on auth.users for each row execute procedure public.handle_delete_user() ";
  await client.$queryRawUnsafe(queryTriggerDeleteUser);

  const createUser = "DO $do$ BEGIN IF NOT EXISTS ( SELECT FROM pg_catalog.pg_user WHERE usename = 'user_postgres')Then CREATE USER user_postgres WITH LOGIN PASSWORD 'user_postgres'; END IF; END $do$; ";
  await client.$queryRawUnsafe(createUser);
  
  await client.$queryRawUnsafe("alter user user_postgres with createdb createrole replication");
  await client.$queryRawUnsafe("GRANT ALL PRIVILEGES ON DATABASE postgres to user_postgres");
  await client.$queryRawUnsafe("GRANT USAGE ON SCHEMA public TO user_postgres");
  await client.$queryRawUnsafe("GRANT USAGE ON SCHEMA auth TO user_postgres");
  await client.$queryRawUnsafe("GRANT ALL PRIVILEGES ON SCHEMA public TO user_postgres");
  await client.$queryRawUnsafe("GRANT ALL PRIVILEGES ON SCHEMA auth TO user_postgres");
  await client.$queryRawUnsafe("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO user_postgres");
  await client.$queryRawUnsafe("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO user_postgres");
  await client.$queryRawUnsafe("GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO user_postgres");
  await client.$queryRawUnsafe("GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO user_postgres");

  await client.$queryRawUnsafe('GRANT ALL ON SCHEMA auth TO "user_postgres"');

  const createRole = "DO $do$ BEGIN IF NOT EXISTS ( SELECT FROM pg_catalog.pg_roles WHERE rolname = 'user')Then create role \"user\" login noinherit; END IF; END $do$; ";
  await client.$queryRawUnsafe(createRole);
  await client.$queryRawUnsafe('grant "user" to authenticator');
  await client.$queryRawUnsafe('GRANT USAGE ON SCHEMA public TO "user"');
  await client.$queryRawUnsafe('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "user"');

  const createRoleAdvancedUser = "DO $do$ BEGIN IF NOT EXISTS ( SELECT FROM pg_catalog.pg_roles WHERE rolname = 'advanced_user_role')Then create role \"advanced_user_role\" login noinherit bypassrls; END IF; END $do$; ";
  await client.$queryRawUnsafe(createRoleAdvancedUser);
  await client.$queryRawUnsafe('grant "advanced_user_role" to authenticator');
  await client.$queryRawUnsafe('GRANT USAGE ON SCHEMA public TO "advanced_user_role"');
  await client.$queryRawUnsafe('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "advanced_user_role"');

  const createRoleBasicUser = "DO $do$ BEGIN IF NOT EXISTS ( SELECT FROM pg_catalog.pg_roles WHERE rolname = 'basic_user_role')Then create role \"basic_user_role\" login; END IF; END $do$; ";
  await client.$queryRawUnsafe(createRoleBasicUser);
  await client.$queryRawUnsafe('grant "basic_user_role" to authenticator');
  await client.$queryRawUnsafe('REVOKE ALL PRIVILEGES ON SCHEMA public FROM "basic_user_role"');
  await client.$queryRawUnsafe('REVOKE ALL PRIVILEGES ON SCHEMA auth FROM "basic_user_role"');

  const createReqUserFunction = "create or replace function requesting_user_id() returns text language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text; $$;";
  await client.$queryRawUnsafe(createReqUserFunction);

  const createReqUserRoleFunction = "create or replace function requesting_user_role() returns text language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::json->>'role', '')::text; $$;";
  await client.$queryRawUnsafe(createReqUserRoleFunction);

  await addAdmin();
  await client.$disconnect();

  console.info("Seeding database with custom seed...");
  console.info("Seeded database successfully");
}