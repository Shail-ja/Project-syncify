-- Fix null first_name and last_name values in users table
-- This script:
-- 1. Updates the trigger to not overwrite existing first_name/last_name
-- 2. Fixes existing null values by checking auth.users metadata

-- Update the trigger function to preserve existing first_name/last_name on conflict
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        CASE 
            WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL 
                 AND TRIM(NEW.raw_user_meta_data->>'first_name') != '' 
            THEN TRIM(NEW.raw_user_meta_data->>'first_name')
            ELSE NULL
        END,
        CASE 
            WHEN NEW.raw_user_meta_data->>'last_name' IS NOT NULL 
                 AND TRIM(NEW.raw_user_meta_data->>'last_name') != '' 
            THEN TRIM(NEW.raw_user_meta_data->>'last_name')
            ELSE NULL
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, public.users.email),
        -- Only update first_name/last_name if they're currently NULL
        first_name = COALESCE(
            NULLIF(public.users.first_name, ''), 
            CASE 
                WHEN EXCLUDED.first_name IS NOT NULL 
                     AND TRIM(EXCLUDED.first_name) != '' 
                THEN TRIM(EXCLUDED.first_name)
                ELSE NULL
            END
        ),
        last_name = COALESCE(
            NULLIF(public.users.last_name, ''), 
            CASE 
                WHEN EXCLUDED.last_name IS NOT NULL 
                     AND TRIM(EXCLUDED.last_name) != '' 
                THEN TRIM(EXCLUDED.last_name)
                ELSE NULL
            END
        ),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix existing null values by checking auth.users metadata
UPDATE public.users u
SET 
    first_name = CASE 
        WHEN u.first_name IS NULL 
             AND au.raw_user_meta_data->>'first_name' IS NOT NULL 
             AND TRIM(au.raw_user_meta_data->>'first_name') != '' 
        THEN TRIM(au.raw_user_meta_data->>'first_name')
        ELSE u.first_name
    END,
    last_name = CASE 
        WHEN u.last_name IS NULL 
             AND au.raw_user_meta_data->>'last_name' IS NOT NULL 
             AND TRIM(au.raw_user_meta_data->>'last_name') != '' 
        THEN TRIM(au.raw_user_meta_data->>'last_name')
        ELSE u.last_name
    END,
    updated_at = CASE 
        WHEN (u.first_name IS NULL AND au.raw_user_meta_data->>'first_name' IS NOT NULL 
              AND TRIM(au.raw_user_meta_data->>'first_name') != '')
          OR (u.last_name IS NULL AND au.raw_user_meta_data->>'last_name' IS NOT NULL 
              AND TRIM(au.raw_user_meta_data->>'last_name') != '')
        THEN NOW()
        ELSE u.updated_at
    END
FROM auth.users au
WHERE u.id = au.id
AND (
    (u.first_name IS NULL AND au.raw_user_meta_data->>'first_name' IS NOT NULL 
     AND TRIM(au.raw_user_meta_data->>'first_name') != '')
    OR
    (u.last_name IS NULL AND au.raw_user_meta_data->>'last_name' IS NOT NULL 
     AND TRIM(au.raw_user_meta_data->>'last_name') != '')
);

