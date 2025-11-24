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

const WAYANG_DESCRIPTIONS: { [key: string]: string } = {
  "Abimanyu": "Putra Arjuna dan Subadra, ksatria muda pemberani yang gugur di Bharatayuddha",
  "Antasena": "Putra Bima dan Arimbi, memiliki kekuatan luar biasa dan dapat hidup di air",
  "Arjuna": "Pangeran ketiga Pandawa, ahli memanah terhebat, murid kesayangan Drona",
  "Bagong": "Punakawan termuda, cerdik dan lucu, pengikut setia Pandawa",
  "Bima": "Pangeran kedua Pandawa, memiliki kekuatan super dan senjata Gada Rujakpolo",
  "Cepot": "Punakawan dari Cirebon, terkenal dengan humor dan kebijaksanaannya",
  "Gareng": "Punakawan yang cacat fisik namun bijak, saudara Petruk dan Bagong",
  "Gatot Kaca": "Putra Bima, ksatria sakti yang dapat terbang dengan kekuatan Aji Narantaka",
  "Hanoman": "Dewa kera putih, setia dan sakti, pembantu utama Sri Rama",
  "Kresna": "Raja Dwarawati, penasihat Pandawa, inkarnasi Dewa Wisnu",
  "Nakula": "Pangeran keempat Pandawa, kembar Sadewa, tampan dan ahli strategi",
  "Petruk": "Punakawan berpostur tinggi, suka bercanda namun cerdas",
  "Semar": "Pemimpin punakawan, dewa yang menyamar, pelindung Pandawa",
  "Yudhistira": "Pangeran sulung Pandawa, raja yang adil dan bijaksana"
};

interface ClassificationRequest {
  image: string;
  model?: string;
}

interface ClassificationResponse {
  predicted_class: string;
  confidence: number;
  description: string;
  all_predictions?: Array<{ class: string; confidence: number; description: string }>;
  model_used: string;
}

function simulateClassification(imageBase64: string): ClassificationResponse {
  if (!imageBase64 || imageBase64.length < 100) {
    throw new Error("Invalid image data");
  }

  const randomIndex = Math.floor(Math.random() * WAYANG_CLASSES.length);
  const confidence = 0.75 + Math.random() * 0.24;
  
  const allPredictions = WAYANG_CLASSES.map((className, idx) => {
    let conf = 0;
    if (idx === randomIndex) {
      conf = confidence;
    } else {
      conf = (1 - confidence) / (WAYANG_CLASSES.length - 1) * (0.8 + Math.random() * 0.4);
    }
    return { 
      class: className, 
      confidence: conf,
      description: WAYANG_DESCRIPTIONS[className] || ""
    };
  }).sort((a, b) => b.confidence - a.confidence);

  const predictedClass = WAYANG_CLASSES[randomIndex];

  return {
    predicted_class: predictedClass,
    confidence: confidence,
    description: WAYANG_DESCRIPTIONS[predictedClass] || "",
    all_predictions: allPredictions.slice(0, 5),
    model_used: "wayang-classifier-v1"
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
        JSON.stringify({ error: "Method not allowed. Use POST." }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be application/json" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: ClassificationRequest = await req.json();

    if (!body.image) {
      return new Response(
        JSON.stringify({ error: "Image data is required in request body" }),
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
        message: error.message || "Unknown error occurred",
        details: "Please ensure the image is valid and try again"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});