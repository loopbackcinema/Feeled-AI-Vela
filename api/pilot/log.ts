import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { table, data } = req.body;
        
        const { error } = await supabase
            .from(table)
            .insert([data]);

        if (error) throw error;

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Logging Error:', error);
        // Don't block the UI if logging fails
        res.status(200).json({ success: false, error: 'Logging failed' }); 
    }
}