import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface Classification {
  id: string;
  image_url: string;
  predicted_class: string;
  confidence: number;
  model_used: string;
  created_at: string;
}

export async function saveClassification(
  imageUrl: string,
  predictedClass: string,
  confidence: number,
  modelUsed: string
) {
  const { data, error } = await supabase
    .from('classifications')
    .insert({
      image_url: imageUrl,
      predicted_class: predictedClass,
      confidence: confidence,
      model_used: modelUsed,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getClassificationHistory(limit: number = 50) {
  const { data, error } = await supabase
    .from('classifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Classification[];
}

export async function classifyImage(imageBase64: string) {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/classify-wayang`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ image: imageBase64 }),
    }
  );

  if (!response.ok) {
    throw new Error('Classification failed');
  }

  return await response.json();
}
