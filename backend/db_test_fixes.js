import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing create instructor...');
    const passwordHash = await bcrypt.hash('testpass', 10);

    const mappedData = {
        name: 'Doctor Test',
        email: 'doctortest@liu.edu.lb',
        password_hash: passwordHash,
        role: 'INSTRUCTOR',
        is_approved: true,
        needs_password_change: true,
    };

    const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(mappedData)
        .select()
        .single();

    if (createError) {
        console.error('Error creating instructor:', createError);
    } else {
        console.log('Instructor created successfully:', newUser);
    }

    console.log('Testing audit logs fetch...');
    const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

    if (logsError) {
        console.error('Error fetching logs:', logsError);
    } else {
        console.log('Logs fetched successfully. Count:', logs.length);
    }
}

test();
