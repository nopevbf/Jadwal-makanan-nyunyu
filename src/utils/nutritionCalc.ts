// Nutrition and portion calculator for cats & kittens based on weight and age

export interface PortionRecommendation {
  dailyCaloriesKcal: number;
  dailyDryG: number;
  dailyDryRange: string;
  dailyWetG: number;
  dailyWetRange: string;
  totalDailyG: string;
  mealsPerDay: number;
  perMealDryG: number;
  perMealDryRange: string;
  perMealWetG: number;
  perMealWetRange: string;
  stageNote: string;
}

export function calculateCatPortions(
  ageMonths: number,
  weightKg: number,
  preference: 'more_dry' | 'balanced' | 'more_wet' = 'more_dry'
): PortionRecommendation {
  // Kitten (under 12 months) has high metabolic energy needs:
  // Base RER (Resting Energy Requirement) = 70 * (weight ^ 0.75)
  // For kittens 4-9 months: DER = 2.5 * RER
  const isKitten = ageMonths < 12;
  const rer = 70 * Math.pow(Math.max(0.5, weightKg), 0.75);
  const der = isKitten ? rer * (ageMonths <= 4 ? 3.0 : 2.5) : rer * 1.2;
  const dailyCalories = Math.round(der);

  let dailyDryG: number;
  let dailyDryRange: string;
  let dailyWetG: number;
  let dailyWetRange: string;

  if (preference === 'more_dry') {
    // Calibrated to the screenshot reference for 6 mo, 2 kg:
    // Dry food: 45-50 g, Wet food: 50-60 g
    const factor = weightKg / 2.0;
    const minDry = Math.round(45 * factor);
    const maxDry = Math.round(50 * factor);
    dailyDryG = Math.round((minDry + maxDry) / 2);
    dailyDryRange = `${minDry}–${maxDry} g`;

    const minWet = Math.round(50 * factor);
    const maxWet = Math.round(60 * factor);
    dailyWetG = Math.round((minWet + maxWet) / 2);
    dailyWetRange = `${minWet}–${maxWet} g`;
  } else if (preference === 'more_wet') {
    const factor = weightKg / 2.0;
    const minDry = Math.round(25 * factor);
    const maxDry = Math.round(30 * factor);
    dailyDryG = Math.round((minDry + maxDry) / 2);
    dailyDryRange = `${minDry}–${maxDry} g`;

    const minWet = Math.round(85 * factor);
    const maxWet = Math.round(100 * factor);
    dailyWetG = Math.round((minWet + maxWet) / 2);
    dailyWetRange = `${minWet}–${maxWet} g`;
  } else {
    // Balanced
    const factor = weightKg / 2.0;
    const minDry = Math.round(35 * factor);
    const maxDry = Math.round(40 * factor);
    dailyDryG = Math.round((minDry + maxDry) / 2);
    dailyDryRange = `${minDry}–${maxDry} g`;

    const minWet = Math.round(65 * factor);
    const maxWet = Math.round(75 * factor);
    dailyWetG = Math.round((minWet + maxWet) / 2);
    dailyWetRange = `${minWet}–${maxWet} g`;
  }

  const mealsPerDay = 3;
  const perMealDryMin = Math.floor(parseInt(dailyDryRange.split('–')[0]) / mealsPerDay);
  const perMealDryMax = Math.ceil(parseInt(dailyDryRange.split('–')[1]) / mealsPerDay);
  const perMealWetMin = Math.floor(parseInt(dailyWetRange.split('–')[0]) / mealsPerDay);
  const perMealWetMax = Math.ceil(parseInt(dailyWetRange.split('–')[1]) / mealsPerDay);

  let stageNote = 'Kitten usia tumbuh aktif butuh nutrisi padat protein (kitten/growth formula).';
  if (ageMonths < 4) {
    stageNote = 'Kitten di bawah 4 bulan memerlukan porsi terbagi sering (3-4 kali sehari) dan tekstur mudah dikunyah.';
  } else if (ageMonths >= 12) {
    stageNote = 'Kucing dewasa (adult) memerlukan kontrol porsi teratur agar tidak obesitas.';
  }

  return {
    dailyCaloriesKcal: dailyCalories,
    dailyDryG,
    dailyDryRange,
    dailyWetG,
    dailyWetRange,
    totalDailyG: `sekitar ${parseInt(dailyDryRange.split('–')[0]) + parseInt(dailyWetRange.split('–')[0])}–${parseInt(dailyDryRange.split('–')[1]) + parseInt(dailyWetRange.split('–')[1])} g makanan/hari`,
    mealsPerDay,
    perMealDryG: Math.round(dailyDryG / mealsPerDay),
    perMealDryRange: `${perMealDryMin}–${perMealDryMax} g`,
    perMealWetG: Math.round(dailyWetG / mealsPerDay),
    perMealWetRange: `${perMealWetMin}–${perMealWetMax} g`,
    stageNote,
  };
}
