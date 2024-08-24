// Cálculo de la constante de crecimiento para el rango de experiencia
export const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75;

/**
 * Calcula el rango de experiencia necesario para un nivel dado.
 * @param {Number} level - El nivel para el cual calcular el rango de XP.
 * @param {Number} [multiplier=1] - Un multiplicador para ajustar el rango de XP.
 * @returns {Object} Un objeto que contiene los valores min y max de XP, así como la diferencia xp.
 */
export function xpRange(level, multiplier = global.multiplier || 1) {
  if (level < 0) {
    throw new TypeError('El nivel no puede ser negativo.');
  }
  
  level = Math.floor(level);
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1;
  const max = Math.round(Math.pow(++level, growth) * multiplier);
  
  return {
    min,
    max,
    xp: max - min,
  };
}

/**
 * Encuentra el nivel correspondiente a una cantidad dada de experiencia.
 * @param {Number} xp - La cantidad de experiencia para encontrar el nivel.
 * @param {Number} [multiplier=1] - Un multiplicador para ajustar el cálculo del nivel.
 * @returns {Number} El nivel correspondiente a la experiencia dada, o -1 si la XP es 0 o negativa.
 */
export function findLevel(xp, multiplier = global.multiplier || 1) {
  if (xp === Infinity) {
    return Infinity;
  }
  if (isNaN(xp)) {
    return NaN;
  }
  if (xp <= 0) {
    return -1;
  }
  
  let level = 0;
  do {
    level++;
  } while (xpRange(level, multiplier).min <= xp);
  
  return --level;
}

/**
 * Determina si el nivel actual puede ser subido con la cantidad de experiencia disponible.
 * @param {Number} level - El nivel actual.
 * @param {Number} xp - La cantidad de experiencia disponible.
 * @param {Number} [multiplier=1] - Un multiplicador para ajustar el cálculo del nivel.
 * @returns {Boolean} Verdadero si el nivel puede ser subido, falso en caso contrario.
 */
export function canLevelUp(level, xp, multiplier = global.multiplier || 1) {
  if (level < 0 || xp <= 0 || isNaN(xp) || xp === Infinity) {
    return false;
  }
  
  return level < findLevel(xp, multiplier);
}
