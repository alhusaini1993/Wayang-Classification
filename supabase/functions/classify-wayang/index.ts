import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const WAYANG_CLASSES = [
  "Abimanyu", "Antasena", "Arjuna", "Bagong", "Bima", "Cepot", "Gareng",
  "Gatot Kaca", "Hanoman", "Kresna", "Nakula", "Petruk", "Semar", "Yudhistira"
];

interface ClassificationRequest {
  image: string;
  model?: string;
}

interface ClassificationResponse {
  predicted_class: string;
  confidence: number;
  all_predictions?: Array<{ class: string; confidence: number }>;
  model_used: string;
}

function simulateClassification(imageBase64: string): ClassificationResponse {
  const randomIndex = Math.floor(Math.random() * WAYANG_CLASSES.length);
  const confidence = 0.7 + Math.random() * 0.29;
  
  const allPredictions = WAYANG_CLASSES.map((className, idx) => {
    let conf = 0;
    if (idx === randomIndex) {
      conf = confidence;
    } else {
      conf = (1 - confidence) / (WAYANG_CLASSES.length - 1) * (0.8 + Math.random() * 0.4);
    }
    return { class: className, confidence: conf };
  }).sort((a, b) => b.confidence - a.confidence);

  return {
    predicted_class: WAYANG_CLASSES[randomIndex],
    confidence: confidence,
    all_predictions: allPredictions.slice(0, 5),
    model_used: "mobile-api-v1"
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: ClassificationRequest = await req.json();

    if (!body.image) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = simulateClassification(body.image);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Classification error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Classification failed",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
