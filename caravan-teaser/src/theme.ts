import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {brand, formats, FormatId, Lang} from './config';
import {extracted} from './generated/brand';

const fonts = [
  {family: 'Anton', file: 'fonts/anton-latin-400-normal.woff2', weight: '400'},
  {family: 'Inter', file: 'fonts/inter-latin-500-normal.woff2', weight: '500'},
  {family: 'Inter', file: 'fonts/inter-latin-700-normal.woff2', weight: '700'},
  {family: 'Vazirmatn', file: 'fonts/vazirmatn-arabic-700-normal.woff2', weight: '700'},
  {family: 'Vazirmatn', file: 'fonts/vazirmatn-arabic-900-normal.woff2', weight: '900'},
];
export const fontsReady = Promise.all(
  fonts.map((f) => loadFont({family: f.family, url: staticFile(f.file), weight: f.weight})),
);

export const accent = brand.accent === 'auto' ? extracted.accent : brand.accent;
export const accentDeep = extracted.accentDeep;

/** Fonts per language. Latin fallbacks keep the @handle readable in the FA version. */
export const typeface = (lang: Lang) =>
  lang === 'fa'
    ? {display: '"Vazirmatn", sans-serif', displayWeight: 900, body: '"Vazirmatn", "Inter", sans-serif', bodyWeight: 700}
    : {display: '"Anton", "Inter", sans-serif', displayWeight: 400, body: '"Inter", sans-serif', bodyWeight: 500};

export const getFormat = (id: FormatId) => formats[id];

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
/** Converts 0-9 to Persian digits (used for every FA string). */
export const toPersianDigits = (s: string) => s.replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
