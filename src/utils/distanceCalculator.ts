// ── Constantes de trajeto
export const DISTANCE_FREE_LIMIT = 60; // km (ida e volta)
export const DISTANCE_COST_PER_KM = 1.60; // R$ por km acima do limite

/**
 * Calcula distância entre duas coordenadas usando fórmula Haversine
 * @param lat1 - Latitude do ponto 1
 * @param lon1 - Longitude do ponto 1
 * @param lat2 - Latitude do ponto 2
 * @param lon2 - Longitude do ponto 2
 * @returns Distância em km
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Arredondar para 1 casa decimal
}

/**
 * Calcula o custo de trajeto baseado na distância (ida e volta)
 * @param distanceKm - Distância total (ida e volta) em km
 * @returns Objeto com distância, custo e mensagens
 */
export function calculateDistanceCost(distanceKm: number) {
  const exceedsLimit = distanceKm > DISTANCE_FREE_LIMIT;
  const excessKm = Math.max(0, distanceKm - DISTANCE_FREE_LIMIT);
  const travelCost = exceedsLimit ? excessKm * DISTANCE_COST_PER_KM : 0;

  return {
    totalDistance: distanceKm,
    freeLimit: DISTANCE_FREE_LIMIT,
    exceedsLimit,
    excessKm,
    costPerKm: DISTANCE_COST_PER_KM,
    travelCost: parseFloat(travelCost.toFixed(2)),
    message: exceedsLimit
      ? `A cada Km rodado acima de ${DISTANCE_FREE_LIMIT}Km será cobrado R$ ${DISTANCE_COST_PER_KM.toFixed(2)}`
      : null,
    summary: exceedsLimit
      ? `Rota ${distanceKm}Km = R$ ${travelCost.toFixed(2)} de trajeto`
      : `Rota ${distanceKm}Km (sem custo adicional)`,
  };
}

/**
 * Formata valor de distância para exibição
 */
export function formatDistance(km: number): string {
  return `${km.toFixed(0)} Km`;
}

/**
 * Formata valor monetário em Real
 */
export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}
