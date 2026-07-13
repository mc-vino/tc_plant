/** Russian translations for supplier-supplied note badges. */
const NOTE_RU: Record<string, string> = {
  "New plant": "Новинка",
  "New price": "Новая цена",
  "New type": "Новый тип",
  "Protected in the US": "Защищён в США",
  "Protected in the US and EU": "Защищён в США и ЕС",
};

export function noteRu(note: string | null | undefined): string | null {
  if (!note) return null;
  return NOTE_RU[note] ?? note;
}

/** Russian plural picker: [one, few, many]. */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

/** "3 сорта", "120 сортов". */
export function varieties(n: number): string {
  return `${n} ${plural(n, ["сорт", "сорта", "сортов"])}`;
}
