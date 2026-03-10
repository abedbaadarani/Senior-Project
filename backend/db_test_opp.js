import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOpp() {
    console.log('Testing create opportunity...');

    const mappedData = {
        title: 'Test Job 123',
        company: 'Test Co',
        type: 'JOB',
        location: '123 Test St',
        mode: 'ONSITE',
        description: '123 test description',
        requirements: ['req 1'],
        deadline: null,
        created_by_user_id: 'a7e5c48f-b9d5-4b6a-83ac-6584c3b384d3', // Doctor Test created earlier
        created_by_role: 'INSTRUCTOR',
    };

    const { data: newOpp, error: createError } = await supabase
        .from('opportunities')
        .insert(mappedData)
        .select()
        .single();

    if (createError) {
        console.error('Error creating opportunity:', createError);
    } else {
        console.log('Opportunity created successfully:', newOpp);
    }
}

testOpp();
