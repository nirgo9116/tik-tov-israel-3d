/**
 * Historical data used by the game (2017–2024).
 *
 * Every game round is one calendar year. Students decide during the year,
 * then the teacher advances to the next year and the real (or clearly
 * fictional) results of the year that just ended are applied.
 *
 * Real series (verify against the primary source before classroom use):
 * - ta125:      TA-125 index, annual change in % (TASE; as listed on Wikipedia "TA-125 Index").
 * - housing:    CBS dwelling price index, annual change in % (as published by the CBS and
 *               quoted on Israeli mortgage-info sites).
 * - cpi:        Consumer price index (inflation), annual change in % (CBS).
 * - boiRateEnd: Bank of Israel policy rate at the end of the year, in %.
 * - deposit:    Simplified deposit return: approximately the AVERAGE BoI rate during the year.
 *               Real bank deposits usually paid less than this.
 * - cpiLinked:  Simplified CPI-linked deposit: earns exactly the CPI change (0% real interest).
 * - mortgageRate: Average interest on new non-indexed mortgages, 20–25 year term, in % (Bank of Israel
 *               data). 2017–2023: yearly averages as listed on primeinv.co.il; 2024: average of the
 *               12 monthly BoI figures as listed on mashcantaman.co.il. Used as a simplified variable rate.
 *
 * - sector*:    TASE sector indices, nominal annual change in %, from the TASE annual reviews
 *               (2018 review: 2017–2018; 2019 review: 2019; 2020 review: technology 2020; 2022 review:
 *               2020–2022; 2023 review: oil & gas 2023; 2024 review: 2023–2024). Banks = TA-Banks5,
 *               Real estate = TA-Real Estate, Tech = TA-Technology, Energy = TA-Oil & Gas.
 *
 * Fictional series (shown in the game with a "בדוי" tag, for teaching only):
 * - fictionalStock: a made-up single tech company, to show concentration risk.
 * - fictionalCoop:  a made-up regional solar co-op.
 */

export type AssetKey =
  | 'deposit'
  | 'cpiLinked'
  | 'ta125'
  | 'housing'
  | 'housingRent'
  | 'fictionalStock'
  | 'sectorBanks'
  | 'sectorRealEstate'
  | 'sectorTech'
  | 'sectorEnergy'
  | 'fictionalCoop';

export interface YearData {
  year: number;
  boiRateEnd: number;
  mortgageRate: number;
  cpi: number;
  returns: Record<AssetKey, number>;
  headline: string;
  detail: string;
}

/** Assumed gross rental yield: yearly rent as % of the apartment's value. */
export const RENT_YIELD = 3;
/** Bank of Israel directive 329: maximum loan-to-value for an investment apartment. */
export const MAX_LTV_INVESTMENT = 0.5;
/** Mortgage term used in the game (years). */
export const MORTGAGE_YEARS = 25;

const SECTORS: Record<number, [number, number, number, number]> = {
  // [banks, real estate, technology, oil & gas]
  2017: [24, 23, 14, -18],
  2018: [5, -11, 2, 4],
  2019: [23, 65, 52, -6],
  2020: [-21.8, -4.6, 38, -44.8],
  2021: [67.9, 53.4, 9, 61.7],
  2022: [-4.0, -28.0, -26, 39.0],
  2023: [10.5, 7.8, 17.0, 33.6],
  2024: [37.9, 25.7, 10.3, 32.3],
};

const MORTGAGE_RATE: Record<number, number> = { 2017: 4.77, 2018: 4.35, 2019: 4.17, 2020: 3.53, 2021: 3.28, 2022: 4.08, 2023: 5.07, 2024: 5.05 };

/** Yearly payment of a loan with `years` yearly payments left, at `ratePct` % a year. */
export function annualPayment(loan: number, ratePct: number, years: number): number {
  if (loan <= 0 || years <= 0) return 0;
  const r = ratePct / 100;
  return r === 0 ? loan / years : (loan * r) / (1 - Math.pow(1 + r, -years));
}

const raw: Array<{
  year: number;
  boiRateEnd: number;
  cpi: number;
  deposit: number;
  ta125: number;
  housing: number;
  fictionalStock: number;
  fictionalCoop: number;
  headline: string;
  detail: string;
}> = [
  {
    year: 2017,
    boiRateEnd: 0.1,
    cpi: 0.4,
    deposit: 0.1,
    ta125: 6.54,
    housing: 1.4,
    fictionalStock: 35,
    fictionalCoop: 4,
    headline: '2017: ריבית אפסית ואינפלציה נמוכה',
    detail: 'ריבית בנק ישראל נשארה 0.1% כל השנה, והמחירים עלו רק ב-0.4%. כסף בפיקדון כמעט לא הרוויח.',
  },
  {
    year: 2018,
    boiRateEnd: 0.25,
    cpi: 0.8,
    deposit: 0.12,
    ta125: -2.42,
    housing: -1.0,
    fictionalStock: -42,
    fictionalCoop: 5,
    headline: '2018: העלאת ריבית ראשונה מזה שנים',
    detail: 'בנובמבר העלה בנק ישראל את הריבית מ-0.1% ל-0.25%. הבורסה ירדה מעט, ומחירי הדירות ירדו בפעם הראשונה מזה שנים.',
  },
  {
    year: 2019,
    boiRateEnd: 0.25,
    cpi: 0.6,
    deposit: 0.25,
    ta125: 21.27,
    housing: 4.2,
    fictionalStock: 18,
    fictionalCoop: 3,
    headline: '2019: שנה חזקה לבורסה בתל אביב',
    detail: 'מדד ת"א-125 עלה כ-21%. מי שהחזיק קרן מחקת מדד לאורך כל השנה נהנה מהעלייה.',
  },
  {
    year: 2020,
    boiRateEnd: 0.1,
    cpi: -0.7,
    deposit: 0.14,
    ta125: -3.01,
    housing: 4.0,
    fictionalStock: 60,
    fictionalCoop: -2,
    headline: '2020: מגפת הקורונה',
    detail: 'במרץ הבורסות קרסו ובנק ישראל הוריד את הריבית ל-0.1%. עד סוף השנה השוק התאושש חלקית, ומדד ת"א-125 סיים בירידה של כ-3%.',
  },
  {
    year: 2021,
    boiRateEnd: 0.1,
    cpi: 2.8,
    deposit: 0.1,
    ta125: 31.15,
    housing: 13.1,
    fictionalStock: 45,
    fictionalCoop: 6,
    headline: '2021: התאוששות חדה',
    detail: 'מדד ת"א-125 עלה כ-31% ומחירי הדירות עלו כ-13%. האינפלציה התחילה לעלות (2.8%).',
  },
  {
    year: 2022,
    boiRateEnd: 3.25,
    cpi: 5.3,
    deposit: 1.3,
    ta125: -11.82,
    housing: 14.7,
    fictionalStock: -55,
    fictionalCoop: 4,
    headline: '2022: האינפלציה מזנקת והריבית עולה',
    detail: 'המחירים עלו ב-5.3%. בנק ישראל העלה את הריבית שש פעמים, מ-0.1% עד 3.25%. הבורסה ירדה כ-12%, ומחירי הדירות עוד עלו.',
  },
  {
    year: 2023,
    boiRateEnd: 4.75,
    cpi: 3.0,
    deposit: 4.5,
    ta125: 4.07,
    housing: -1.0,
    fictionalStock: -20,
    fictionalCoop: 5,
    headline: '2023: ריבית גבוהה ואי-ודאות',
    detail: 'הריבית הגיעה ל-4.75%, ולראשונה מזה שנים פיקדון בבנק הניב תשואה משמעותית. מחירי הדירות ירדו מעט. שנה של אי-ודאות פוליטית וביטחונית בישראל.',
  },
  {
    year: 2024,
    boiRateEnd: 4.5,
    cpi: 3.2,
    deposit: 4.5,
    ta125: 28.6,
    housing: 7.7,
    fictionalStock: 30,
    fictionalCoop: 5,
    headline: '2024: הבורסה מזנקת',
    detail: 'בינואר הוריד בנק ישראל את הריבית ל-4.5%. מדד ת"א-125 עלה כ-29% ומחירי הדירות עלו כ-8%.',
  },
];

export const HISTORY: YearData[] = raw.map((r) => ({
  year: r.year,
  boiRateEnd: r.boiRateEnd,
  mortgageRate: MORTGAGE_RATE[r.year],
  cpi: r.cpi,
  headline: r.headline,
  detail: r.detail,
  returns: {
    deposit: r.deposit,
    cpiLinked: r.cpi,
    ta125: r.ta125,
    housing: r.housing,
    housingRent: r.housing + RENT_YIELD,
    fictionalStock: r.fictionalStock,
    fictionalCoop: r.fictionalCoop,
    sectorBanks: SECTORS[r.year][0],
    sectorRealEstate: SECTORS[r.year][1],
    sectorTech: SECTORS[r.year][2],
    sectorEnergy: SECTORS[r.year][3],
  },
}));

export const FIRST_YEAR = HISTORY[0].year;
export const LAST_YEAR = HISTORY[HISTORY.length - 1].year;
/** BoI rate known to players at the start of the first year (end of 2016). */
export const START_RATE = 0.1;

export function yearData(year: number): YearData | undefined {
  return HISTORY.find((h) => h.year === year);
}

export const SOURCES: Array<{ label: string; url: string }> = [
  { label: 'מדד ת"א-125, תשואות שנתיות (ויקיפדיה, לפי הבורסה)', url: 'https://en.wikipedia.org/wiki/TA-125_Index' },
  { label: 'הבורסה לניירות ערך בתל אביב', url: 'https://www.tase.co.il' },
  { label: 'מדד מחירי הדירות ומדד המחירים לצרכן (הלמ"ס)', url: 'https://www.cbs.gov.il' },
  { label: 'ריבית בנק ישראל', url: 'https://www.boi.org.il' },
  { label: 'ריבית ממוצעת על משכנתאות לא צמודות, 2017–2023 (לפי נתוני בנק ישראל)', url: 'https://primeinv.co.il/%D7%A8%D7%99%D7%91%D7%99%D7%95%D7%AA-%D7%9E%D7%A9%D7%9B%D7%A0%D7%AA%D7%90/' },
  { label: 'ריבית ממוצעת על משכנתאות לא צמודות, 2024 (לפי נתוני בנק ישראל)', url: 'https://mashcantaman.co.il/%D7%A8%D7%99%D7%91%D7%99%D7%AA-%D7%9E%D7%A9%D7%9B%D7%A0%D7%AA%D7%90-%D7%9E%D7%9E%D7%95%D7%A6%D7%A2%D7%AA/' },
  { label: 'מדדי הענפים בבורסה (בנקים-5, נדל"ן, טכנולוגיה, נפט וגז): הסקירות השנתיות של הבורסה 2018–2024', url: 'https://content.tase.co.il/media/zlupjwg3/2024_annualreview_heb.pdf' },
  { label: 'הוראת ניהול בנקאי תקין 329: עד 50% מימון לדירה להשקעה', url: 'https://boi.org.il/media/uwaetnrb/447.pdf' },
];
