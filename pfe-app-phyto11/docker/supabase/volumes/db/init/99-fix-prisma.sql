-- Cette fonction simule le comportement de Supabase pour extraire l'ID utilisateur du JWT
-- Elle est nécessaire pour que les migrations Prisma ne plantent pas
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql STABLE;
-- Alias _user_id() requis par la migration 20250602154215
CREATE OR REPLACE FUNCTION public._user_id()
RETURNS text AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql STABLE;