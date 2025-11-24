import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveClassification(imageUrl, predictedClass, confidence, modelUsed) {
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

export async function getClassificationHistory(limit = 50) {
  const { data, error } = await supabase
    .from('classifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function classifyImage(imageBase64) {
  try {
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Classification failed');
    }

    return data;
  } catch (error) {
    console.error('Classification API error:', error);
    throw new Error(error.message || 'Failed to connect to classification service');
  }
}
