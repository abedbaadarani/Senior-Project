import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing connection to Supabase...');
    try {
        // Attempt to select from users table
        const { data: users, error: errorUsers } = await supabase.from('users').select('id, email, first_name, last_name, role').limit(2);

        if (errorUsers) {
            console.error('Error fetching users:', errorUsers.message);
        } else {
            console.log('Users fetch successful. Sample data:', users);
            console.log('Database access is fully working via the Service Role Key!');
        }
    } catch (err) {
        console.error('Exception during Supabase call:', err);
    }
}

testConnection();
