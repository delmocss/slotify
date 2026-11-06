-- ============================================================================
-- 002 - Migracion v1/hibrido -> v2 CONSERVANDO DATOS
--
-- Estado de partida (produccion, comprobado el 2026-11-06): existen users,
-- organizations y organization_members, pero businesses.id != organization_id,
-- businesses.password_hash sigue siendo NOT NULL y organization_id no tiene FK.
--
-- v2 asume businesses.id = organizations.id (el id de la organizacion se usa
-- como business_id en servicios, reservas y horarios).
--
-- Estrategia: NO se toca businesses.id (asi services/bookings/working_hours
-- quedan intactos, y bookings tiene un CHECK date >= CURRENT_DATE que haria
-- fallar cualquier UPDATE sobre reservas pasadas). Se recrean las
-- organizaciones con el id del negocio, se repuntan los miembros y se borran
-- las antiguas.
--
-- Todo va en UNA transaccion: si falla cualquier guarda, no cambia nada.
-- Haz un backup antes de ejecutarlo en produccion.
-- ============================================================================
BEGIN;

-- --- 0. Foto de recuentos para verificar al final -----------------------------
CREATE TEMP TABLE _before AS
SELECT
  (SELECT count(*) FROM users) AS users,
  (SELECT count(*) FROM businesses) AS businesses,
  (SELECT count(*) FROM services) AS services,
  (SELECT count(*) FROM bookings) AS bookings,
  (SELECT count(*) FROM working_hours) AS working_hours,
  (SELECT count(*) FROM organization_members) AS members;

-- --- 1. Guardas: abortar si el estado no es el esperado ----------------------
DO $$
DECLARE n int;
BEGIN
  IF EXISTS (SELECT 1 FROM businesses b LEFT JOIN organizations o ON o.id = b.organization_id WHERE o.id IS NULL) THEN
    RAISE EXCEPTION 'Hay negocios cuya organization_id no existe en organizations';
  END IF;
  IF EXISTS (SELECT 1 FROM businesses GROUP BY organization_id HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Hay varias businesses apuntando a la misma organizacion';
  END IF;
  IF EXISTS (SELECT 1 FROM businesses WHERE slug IS NULL) THEN
    RAISE EXCEPTION 'Hay negocios sin slug';
  END IF;
  IF EXISTS (SELECT 1 FROM organization_members WHERE organization_id IS NULL OR user_id IS NULL) THEN
    RAISE EXCEPTION 'Hay miembros con organization_id o user_id nulos';
  END IF;
  IF EXISTS (
    SELECT 1 FROM businesses b
    WHERE NOT EXISTS (SELECT 1 FROM organization_members m WHERE m.organization_id = b.organization_id)
  ) THEN
    RAISE EXCEPTION 'Hay negocios cuya organizacion no tiene ningun miembro (nadie podria entrar)';
  END IF;

  -- Informativo: v1 valida contra businesses.password_hash, v2 contra users.password_hash.
  SELECT count(*) INTO n FROM businesses b JOIN users u ON u.email = b.email
   WHERE u.password_hash IS DISTINCT FROM b.password_hash;
  IF n > 0 THEN
    RAISE NOTICE '% usuarios tienen un hash distinto en users y en businesses (v2 usara el de users)', n;
  END IF;
END $$;

-- --- 2. Alinear organizations.id con businesses.id ---------------------------
INSERT INTO organizations (id, name, created_at)
SELECT b.id, o.name, o.created_at
FROM businesses b JOIN organizations o ON o.id = b.organization_id
WHERE b.organization_id <> b.id;

UPDATE organization_members m
SET organization_id = b.id
FROM businesses b
WHERE m.organization_id = b.organization_id AND b.organization_id <> b.id;

DELETE FROM organizations o
USING businesses b
WHERE o.id = b.organization_id AND b.organization_id <> b.id;

UPDATE businesses SET organization_id = id WHERE organization_id <> id;

-- --- 3. Restricciones de v2 --------------------------------------------------
ALTER TABLE businesses ALTER COLUMN password_hash DROP NOT NULL;  -- v2 ya no lo rellena
ALTER TABLE businesses ALTER COLUMN slug SET NOT NULL;
ALTER TABLE businesses ADD CONSTRAINT businesses_organization_id_key UNIQUE (organization_id);
ALTER TABLE businesses ADD CONSTRAINT businesses_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE businesses ADD CONSTRAINT businesses_id_is_organization_id
  CHECK (id = organization_id);  -- fija la convencion de v2
ALTER TABLE organization_members ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE organization_members ALTER COLUMN user_id SET NOT NULL;

-- --- 4. Verificacion final: nada se ha perdido -------------------------------
DO $$
DECLARE b _before%ROWTYPE;
BEGIN
  SELECT * INTO b FROM _before;
  IF b.users         <> (SELECT count(*) FROM users)                THEN RAISE EXCEPTION 'users cambio'; END IF;
  IF b.businesses    <> (SELECT count(*) FROM businesses)           THEN RAISE EXCEPTION 'businesses cambio'; END IF;
  IF b.services      <> (SELECT count(*) FROM services)             THEN RAISE EXCEPTION 'services cambio'; END IF;
  IF b.bookings      <> (SELECT count(*) FROM bookings)             THEN RAISE EXCEPTION 'bookings cambio'; END IF;
  IF b.working_hours <> (SELECT count(*) FROM working_hours)        THEN RAISE EXCEPTION 'working_hours cambio'; END IF;
  IF b.members       <> (SELECT count(*) FROM organization_members) THEN RAISE EXCEPTION 'organization_members cambio'; END IF;
  IF EXISTS (SELECT 1 FROM businesses WHERE id <> organization_id) THEN RAISE EXCEPTION 'quedan businesses con id distinto de organization_id'; END IF;
END $$;

COMMIT;

-- --- Despues de desplegar v2 y comprobar que todo funciona (migracion aparte):
--   ALTER TABLE businesses DROP COLUMN password_hash;
