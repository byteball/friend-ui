export const toLocalString = (numberOrString: string | number, locale: string = 'en-US') => {
  return Number(+Number(numberOrString).toFixed(9)).toLocaleString(locale, {
    maximumFractionDigits: 18,
    maximumSignificantDigits: 9,
  });
};
