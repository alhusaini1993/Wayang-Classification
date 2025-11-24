const WAYANG_CLASSES = [
  "Abimanyu", "Antasena", "Arjuna", "Bagong", "Bima", "Cepot", "Gareng",
  "Gatot Kaca", "Hanoman", "Kresna", "Nakula", "Petruk", "Semar", "Yudhistira"
];

const WAYANG_DESCRIPTIONS = {
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
  "Semar": "Pemimpin punakawan, dewa yang menyar, pelindung Pandawa",
  "Yudhistira": "Pangeran sulung Pandawa, raja yang adil dan bijaksana"
};

export async function loadModel() {
  console.log('Using server-side classification model');
  return Promise.resolve(true);
}

export async function classifyImageWithTF(imageDataUrl) {
  console.log('TensorFlow.js not available, using server-side classification');
  throw new Error('Use server-side classification');
}

export function isModelSupported() {
  return false;
}
