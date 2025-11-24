/*
  # Create Wayang Classifications Table

  1. New Tables
    - `classifications`
      - `id` (uuid, primary key) - Unique identifier for each classification
      - `image_url` (text) - URL of the classified image
      - `predicted_class` (text) - The predicted wayang character name
      - `confidence` (float) - Confidence score of the prediction (0-1)
      - `model_used` (text) - Name of the model used for classification
      - `created_at` (timestamptz) - Timestamp when classification was made
      - `user_id` (uuid, nullable) - Reference to user who made the classification

  2. Security
    - Enable RLS on `classifications` table
    - Add policy for anyone to insert classifications (public app)
    - Add policy for anyone to read classifications (public app)
*/

CREATE TABLE IF NOT EXISTS classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  predicted_class text NOT NULL,
  confidence float NOT NULL,
  model_used text NOT NULL DEFAULT 'mobile-api',
  created_at timestamptz DEFAULT now(),
  user_id uuid
);

ALTER TABLE classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert classifications"
  ON classifications
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view classifications"
  ON classifications
  FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_classifications_created_at ON classifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_classifications_predicted_class ON classifications(predicted_class);
