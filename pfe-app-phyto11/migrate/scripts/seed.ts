import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
//import { Salt, parseSalt } from "../src/auth/password.service";
import { addAdmin } from "./addAdmin";
import * as Sentry from "@sentry/node";

// Initialize Sentry for error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN, // Set up Sentry DSN
  tracesSampleRate: 1.0, // Set traces sample rate
});

// Check if the script is executed directly
if (require.main === module) {
  dotenv.config(); // Load environment variables from .env file

  // const { BCRYPT_SALT } = process.env;

  // if (!BCRYPT_SALT) {
  //   throw new Error("BCRYPT_SALT environment variable must be defined");
  // }
  //const salt = parseSalt(BCRYPT_SALT);

  // Call the seed function with the salt and handle any errors
  seed().catch((error) => {
    console.error(error);
    Sentry.captureException(error); // Capture the error with Sentry
    Sentry.close(2000).then(function () {
      process.exit(1);
    });
  });
}

// Define the seed function
async function seed() {
  console.info("Seeding database...");

  const client = new PrismaClient(); // Initialize Prisma client

  // Create role "admin" if it doesn't exist
  const queryAddRoleAdmin =
    "DO\n  $do$\n  BEGIN\n     IF NOT EXISTS (\n        SELECT FROM pg_catalog.pg_roles\n        WHERE  rolname = 'admin') THEN\n        CREATE ROLE \"admin\";\n     END IF;\n  END\n  $do$;";
  await client.$queryRawUnsafe(queryAddRoleAdmin);

  // Grant usage on the public schema to role "admin"
  const queryGRANTUsageToAdmin = 'GRANT USAGE ON SCHEMA public TO "admin"';
  await client.$queryRawUnsafe(queryGRANTUsageToAdmin);

  // Grant all privileges on all tables in the public schema to role "admin"
  const queryGRANTPRIVILEGESTABLESToAdmin =
    'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public to "admin"';
  await client.$queryRawUnsafe(queryGRANTPRIVILEGESTABLESToAdmin);

  // Grant all privileges on all sequences in the public schema to role "admin"
  const queryGRANTPRIVILEGESSEQUENCESToAdmin =
    'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "admin"';
  await client.$queryRawUnsafe(queryGRANTPRIVILEGESSEQUENCESToAdmin);

  // Create role "user" if it doesn't exist
  const queryAddRoleUser =
    "DO\n  $do$\n  BEGIN\n     IF NOT EXISTS (\n        SELECT FROM pg_catalog.pg_roles\n        WHERE  rolname = 'user') THEN\n        CREATE ROLE \"user\";\n     END IF;\n  END\n  $do$;";
  await client.$queryRawUnsafe(queryAddRoleUser);

  // Grant usage on the public schema to role "user"
  const queryGRANTUsageToUser = 'GRANT USAGE ON SCHEMA public TO "user"';
  await client.$queryRawUnsafe(queryGRANTUsageToUser);

  // Grant all privileges on all tables in the public schema to role "user"
  const queryGRANTPRIVILEGESTABLESToUser =
    'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public to "user"';
  await client.$queryRawUnsafe(queryGRANTPRIVILEGESTABLESToUser);

  // Grant all privileges on all sequences in the public schema to role "user"
  const queryGRANTPRIVILEGESSEQUENCESToUser =
    'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "user"';
  await client.$queryRawUnsafe(queryGRANTPRIVILEGESSEQUENCESToUser);

  // Enable row level security for the "User" table in the public schema
  const queryEnableRowSecurity =
    'alter table public."User" enable row level security';
  await client.$queryRawUnsafe(queryEnableRowSecurity);

  // Define advanced user role
  const queryAddRoleAdvancedUser =
    "DO\n  $do$\n  BEGIN\n     IF NOT EXISTS (\n        SELECT FROM pg_catalog.pg_roles\n        WHERE  rolname = 'advanced_user_role') THEN\n        CREATE ROLE \"advanced_user_role\";\n     END IF;\n  END\n  $do$;";
  await client.$queryRawUnsafe(queryAddRoleAdvancedUser);

  // Grant usage on the public schema to role "advanced_user_role"
  const queryGRANTUsageToAdvancedUser =
    'GRANT USAGE ON SCHEMA public TO "advanced_user_role"';
  await client.$queryRawUnsafe(queryGRANTUsageToAdvancedUser);

  // Grant all privileges on all tables in the public schema to role "advanced_user_role"
  const queryGRANTPRIVILEGESTABLESToAdvancedUser =
    'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public to "advanced_user_role"';
  await client.$queryRawUnsafe(queryGRANTPRIVILEGESTABLESToAdvancedUser);

  // Grant all privileges on all sequences in the public schema to role "advanced_user_role"
  const queryGRANTPRIVILEGESSEQUENCESToAdvancedUser =
    'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "advanced_user_role"';
  await client.$queryRawUnsafe(queryGRANTPRIVILEGESSEQUENCESToAdvancedUser);

  // Enable row level security for the "User" table for advanced users
  const queryEnableRowSecurityAdvancedUser =
    'alter table public."User" enable row level security';
  await client.$queryRawUnsafe(queryEnableRowSecurityAdvancedUser);

  // Define basic user role
  const queryAddRoleBasicUser =
    "DO\n  $do$\n  BEGIN\n     IF NOT EXISTS (\n        SELECT FROM pg_catalog.pg_roles\n        WHERE  rolname = 'basic_user_role') THEN\n        CREATE ROLE \"basic_user_role\";\n     END IF;\n  END\n  $do$;";
  await client.$queryRawUnsafe(queryAddRoleBasicUser);

  // Define policy for selecting users
  const queryPolicySelect =
    "DO " +
    "$do$ " +
    "BEGIN " +
    "IF NOT EXISTS ( " +
    "SELECT FROM pg_catalog.pg_policies " +
    "WHERE  policyname = 'Public users are viewable by everyone.') THEN " +
    'create policy "Public users are viewable by everyone." on public."User" for select using ( true );' +
    "END IF; " +
    "END " +
    "$do$; ";
  await client.$queryRawUnsafe(queryPolicySelect);

  // Define policy for inserting users
  const queryPolicyInsert =
    "DO " +
    "$do$ " +
    "BEGIN " +
    "IF NOT EXISTS ( " +
    "SELECT FROM pg_catalog.pg_policies " +
    "WHERE  policyname = 'Users can insert their own users.') THEN " +
    'create policy "Users can insert their own users." on public."User" for insert with check ( auth.uid()::text = id );' +
    "END IF; " +
    "END " +
    "$do$; ";
  await client.$queryRawUnsafe(queryPolicyInsert);

  // Define policy for updating users
  const queryPolicyUpdate =
    "DO " +
    "$do$ " +
    "BEGIN " +
    "IF NOT EXISTS ( " +
    "SELECT FROM pg_catalog.pg_policies " +
    "WHERE  policyname = 'Users can update own users or update invited not valid users') THEN " +
    'create policy "Users can update own users or update invited not valid users" on public."User" for update using (((select invited_at from auth.users as au where au.id::text = "User".id and "User"."isValid" = false) is not null ) OR (auth.uid()::text = id));' +
    "END IF; " +
    "END " +
    "$do$; ";
  await client.$queryRawUnsafe(queryPolicyUpdate);

  // Define policy for selecting users by ID
  const queryPolicySelectId =
    "DO " +
    "$do$ " +
    "BEGIN " +
    "IF NOT EXISTS ( " +
    "SELECT FROM pg_catalog.pg_policies " +
    "WHERE  policyname = 'Users are viewable by users who created them.') THEN " +
    'create policy "Users are viewable by users who created them." on public."User" for select using ( auth.uid()::text = id );' +
    "END IF; " +
    "END " +
    "$do$; ";
  await client.$queryRawUnsafe(queryPolicySelectId);

  // Define a function to add a new user or update an existing user
  const queryFunctionAddUser =
    'CREATE OR REPLACE FUNCTION public.handle_new_user()\n  RETURNS trigger\n  LANGUAGE \'plpgsql\'\n  COST 100\n  VOLATILE NOT LEAKPROOF SECURITY DEFINER\n  SET search_path=public\nAS $$\n  begin\n  IF (new.raw_app_meta_data->>\'provider\' = \'email\') then\n    IF (((new.invited_at is not null) and (old.last_sign_in_at is null))) then\n      insert into public."User" (id,"createdAt","updatedAt",username,roles, "firstName", "lastName")\n      values (new.id::text,new.created_at,new.updated_at,new.email,ARRAY[new.role], new.raw_user_meta_data->>\'firstName\', new.raw_user_meta_data->>\'lastName\')\n      ON CONFLICT (id)\n      DO\n      UPDATE SET "createdAt" = new.created_at,"updatedAt" = new.updated_at,username = new.email,roles = ARRAY[new.role], "firstName" = new.raw_user_meta_data->>\'firstName\',"lastName" = new.raw_user_meta_data->>\'lastName\';\n    ELSE\n      insert into public."User" (id,"createdAt","updatedAt",username,roles, "firstName", "lastName")\n      values (new.id::text,new.created_at,new.updated_at,new.email, ARRAY[new.role], new.raw_user_meta_data->>\'firstName\', new.raw_user_meta_data->>\'lastName\')\n      ON CONFLICT (id)\n      DO\n      UPDATE SET "createdAt" = new.created_at,"updatedAt" = new.updated_at,username = new.email ,roles = ARRAY[new.role], "firstName" = new.raw_user_meta_data->>\'firstName\',"lastName" = new.raw_user_meta_data->>\'lastName\';\n    END IF;\n  ELSE \n    IF new.role = \'authenticated\' \n    THEN\n      UPDATE auth.users SET role=\'user\' WHERE id = new.id;\n      new.role := \'user\';\n      RETURN NEW;\n    END IF;\n    insert into public."User" (id,"createdAt","updatedAt","firstName","lastName", username,roles)\n    values (new.id::text,new.created_at,new.updated_at,new.raw_user_meta_data->>\'firstName\',new.raw_user_meta_data->>\'lastName\',new.email,ARRAY[new.role])\n    ON CONFLICT (id)\n    DO UPDATE SET "createdAt" = new.created_at,"updatedAt" = new.updated_at, "firstName" = new.raw_user_meta_data->>\'firstName\', "lastName" = new.raw_user_meta_data->>\'lastName\', username = new.email, roles = ARRAY[new.role];\n  END IF;\n  return new;\n  end $$;';
  await client.$queryRawUnsafe(queryFunctionAddUser);

  // Define a function to delete a user when a row is deleted in auth.users
  const queryFunctionDeleteUser =
    "create or replace function public.handle_delete_user() " +
    "returns trigger " +
    "language plpgsql " +
    "security definer set search_path = public " +
    "as $$ " +
    "begin " +
    'delete from public."User" where id = old.id::text; ' +
    "return old; " +
    "end; " +
    "$$; ";
  await client.$queryRawUnsafe(queryFunctionDeleteUser);

  // Create the "user_postgres" user and grant permissions

  //   const queryFunctionChangePassword = `CREATE OR REPLACE FUNCTION update_user_password(password text,newpassword text)
  //   RETURNS BOOLEAN SECURITY DEFINER AS
  //   $$
  //   BEGIN
  //   UPDATE auth.users
  //   SET encrypted_password = extensions.crypt(newpassword::text, auth.users.encrypted_password)
  //   WHERE id = auth.uid()
  //     AND encrypted_password = extensions.crypt(password::text, auth.users.encrypted_password);
  //     IF NOT FOUND THEN
  //     RAISE EXCEPTION 'incorrect password';
  //     END IF;
  //     RETURN true;
  // END;
  //   $$ LANGUAGE plpgsql;`;
  //   await client.$queryRawUnsafe(queryFunctionChangePassword);

  const queryTriggerAddUser =
    "create or replace trigger on_auth_user_created " +
    "after insert or update on auth.users " +
    "for each row execute procedure public.handle_new_user() ";

  await client.$queryRawUnsafe(queryTriggerAddUser);

  const queryTriggerDeleteUser =
    "create or replace trigger on_auth_user_deleted " +
    "after delete on auth.users " +
    "for each row execute procedure public.handle_delete_user() ";

  await client.$queryRawUnsafe(queryTriggerDeleteUser);

  const createUser =
    "DO " +
    "$do$ " +
    "BEGIN " +
    "IF NOT EXISTS ( " +
    "SELECT FROM pg_catalog.pg_user " +
    "WHERE  usename = 'user_postgres')Then " +
    "CREATE USER user_postgres WITH LOGIN PASSWORD 'user_postgres'; " +
    "END IF; " +
    "END " +
    "$do$; ";
  await client.$queryRawUnsafe(createUser);
  await client.$queryRawUnsafe(
    "alter user user_postgres with createdb createrole replication"
  );
  await client.$queryRawUnsafe(
    "GRANT ALL PRIVILEGES ON DATABASE postgres to user_postgres"
  );
  await client.$queryRawUnsafe("GRANT USAGE ON SCHEMA public TO user_postgres");
  await client.$queryRawUnsafe("GRANT USAGE ON SCHEMA auth TO user_postgres");

  await client.$queryRawUnsafe(
    "GRANT ALL PRIVILEGES ON SCHEMA public TO user_postgres"
  );
  await client.$queryRawUnsafe(
    "GRANT ALL PRIVILEGES ON SCHEMA auth TO user_postgres"
  );
  await client.$queryRawUnsafe(
    "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO user_postgres"
  );
  await client.$queryRawUnsafe(
    "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO user_postgres"
  );
  await client.$queryRawUnsafe(
    "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO user_postgres"
  );
  await client.$queryRawUnsafe(
    "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO user_postgres"
  );

  const queryGRANTSelectAuthUsersToUserPostgres =
    'GRANT ALL ON SCHEMA auth TO "user_postgres"';
  await client.$queryRawUnsafe(queryGRANTSelectAuthUsersToUserPostgres);

  // Create the "user" role and grant permissions
  const createRole =
    "DO " +
    "$do$ " +
    "BEGIN " +
    "IF NOT EXISTS ( " +
    "SELECT FROM pg_catalog.pg_roles " +
    "WHERE  rolname = 'user')Then " +
    'create role "user" login noinherit;' +
    "END IF; " +
    "END " +
    "$do$; ";
  await client.$queryRawUnsafe(createRole);
  await client.$queryRawUnsafe('grant "user" to authenticator');
  await client.$queryRawUnsafe('GRANT USAGE ON SCHEMA public TO "user"');
  await client.$queryRawUnsafe(
    'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "user"'
  );

  // Create the "advanced_user_role" role and grant permissions
  const createRoleAdvancedUser =
    "DO " +
    "$do$ " +
    "BEGIN " +
    "IF NOT EXISTS ( " +
    "SELECT FROM pg_catalog.pg_roles " +
    "WHERE  rolname = 'advanced_user_role')Then " +
    'create role "advanced_user_role" login noinherit bypassrls;' +
    "END IF; " +
    "END " +
    "$do$; ";
  await client.$queryRawUnsafe(createRoleAdvancedUser);
  await client.$queryRawUnsafe('grant "advanced_user_role" to authenticator');
  await client.$queryRawUnsafe(
    'GRANT USAGE ON SCHEMA public TO "advanced_user_role"'
  );
  await client.$queryRawUnsafe(
    'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "advanced_user_role"'
  );

  // Create the "basic_user_role" role and grant permissions
  const createRoleBasicUser =
    "DO " +
    "$do$ " +
    "BEGIN " +
    "IF NOT EXISTS ( " +
    "SELECT FROM pg_catalog.pg_roles " +
    "WHERE  rolname = 'basic_user_role')Then " +
    'create role "basic_user_role" login;' +
    "END IF; " +
    "END " +
    "$do$; ";
  await client.$queryRawUnsafe(createRoleBasicUser);
  await client.$queryRawUnsafe('grant "basic_user_role" to authenticator');
  // Prevent access for basic user role on schema public
  await client.$queryRawUnsafe(
    'REVOKE ALL PRIVILEGES ON SCHEMA public FROM "basic_user_role"'
  );
  // Prevent access for basic user role on schema auth
  await client.$queryRawUnsafe(
    'REVOKE ALL PRIVILEGES ON SCHEMA auth FROM "basic_user_role"'
  );

  // Create a function to retrieve the requesting user's ID
  const createReqUserFunction =
    "create or replace function requesting_user_id() " +
    "returns text " +
    "language sql stable " +
    "as $$ " +
    "select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text; " +
    "$$;";
  await client.$queryRawUnsafe(createReqUserFunction);

  // Create a function to retrieve the requesting user's role
  const createReqUserRoleFunction =
    "create or replace function requesting_user_role() " +
    "returns text " +
    "language sql stable " +
    "as $$ " +
    "select nullif(current_setting('request.jwt.claims', true)::json->>'role', '')::text; " +
    "$$;";
  await client.$queryRawUnsafe(createReqUserRoleFunction);

  // Add an admin user with email "admin@gmail.com" and password "admin"
  await addAdmin();

  client.$disconnect();

  console.info("Seeding database with custom seed...");
  console.info("Seeded database successfully");
}
