
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjnblxlyajvgdypdviag.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbmJseGx5YWp2Z2R5cGR2aWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzQwMDgsImV4cCI6MjA3NjU1MDAwOH0.Bt5oQl75JbEMJq0OS77eKOu20QH-OarbprfypioOZJ8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
