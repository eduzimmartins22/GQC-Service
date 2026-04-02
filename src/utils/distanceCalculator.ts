// ── Constantes de trajeto
export const DISTANCE_FREE_LIMIT = 60; // km (ida e volta)
export const DISTANCE_COST_PER_KM = 1.60; // R$ por km acima do limite

/**
 * Calcula o custo de trajeto baseado na distância (ida e volta)
 * @param distanceKm - Distância total (ida e volta) em km
 * @param isTechnician - Define se pode ver detalhes de KM
 */
export function calculateDistanceCost(distanceKm: number, isTechnician: boolean = false) {
  const exceedsLimit = distanceKm > DISTANCE_FREE_LIMIT;
  const excessKm = Math.max(0, distanceKm - DISTANCE_FREE_LIMIT);
  const travelCost = exceedsLimit ? excessKm * DISTANCE_COST_PER_KM : 0;

  // 🔒 CLIENTE: NÃO recebe nenhuma info de KM
  if (!isTechnician) {
    return {
      travelCost: parseFloat(travelCost.toFixed(2)),
    };
  }

  // 🛠️ TÉCNICO: vê tudo
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
 * Formata valor de distância para exibição (USAR APENAS PARA TÉCNICO)
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
