import circuitGeoJson from "@/lib/data/f1-circuits.json";

type CircuitFeature = {
  properties?: {
    Name?: string;
  };
  geometry?: {
    type?: string;
    coordinates?: number[][];
  };
};

export type CircuitOutlineData = {
  name: string;
  viewBox: string;
  path: string;
};

export type CircuitOutlineLookupInput = {
  circuitId?: string | null;
  circuitName?: string | null;
};

const OUTLINE_MAX_DIMENSION = 120;
const OUTLINE_PADDING = 8;

function normalizeCircuitKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const outlineAliases = new Map<string, string>([
  ["albert-park-grand-prix-circuit", "Albert Park Circuit"],
  ["melbourne-grand-prix-circuit", "Albert Park Circuit"],
  ["autodromo-hermanos-rodriguez", "Aut\u00f3dromo Hermanos Rodr\u00edguez"],
  ["autodromo-internacional-do-algarve", "Aut\u00f3dromo Internacional do Algarve"],
  ["autodromo-jose-carlos-pace", "Aut\u00f3dromo Jos\u00e9 Carlos Pace - Interlagos"],
  ["autodromo-nazionale-di-monza", "Autodromo Nazionale Monza"],
  ["circuit-gilles-villeneuve", "Circuit Gilles-Villeneuve"],
  ["circuit-park-zandvoort", "Circuit Zandvoort"],
  ["istanbul-park", "Intercity Istanbul Park"],
  ["las-vegas-strip-street-circuit", "Las Vegas Street Circuit"],
  ["madring", "Circuito de Madring"],
  ["nurburgring", "N\u00fcrburgring"],
  ["suzuka-circuit", "Suzuka International Racing Course"],
]);

const features = (circuitGeoJson.features as CircuitFeature[]).filter(
  (feature) => feature.geometry?.type === "LineString" && (feature.geometry.coordinates?.length ?? 0) > 1,
);

const featureByNormalizedName = new Map(
  features.map((feature) => [normalizeCircuitKey(feature.properties?.Name ?? ""), feature]),
);

function resolveFeatureByNameVariant(value: string) {
  const normalizedValue = normalizeCircuitKey(value);
  const aliasTarget = outlineAliases.get(normalizedValue);

  return (
    featureByNormalizedName.get(normalizedValue) ??
    (aliasTarget ? featureByNormalizedName.get(normalizeCircuitKey(aliasTarget)) : undefined) ??
    null
  );
}

function resolveFeatureByCircuitId(circuitId: string) {
  const normalizedId = normalizeCircuitKey(circuitId.replace(/_/g, "-"));
  const exactMatch = resolveFeatureByNameVariant(normalizedId);

  if (exactMatch) {
    return exactMatch;
  }

  const idTokens = normalizedId.split("-").filter(Boolean);
  if (idTokens.length === 0) {
    return null;
  }

  const rankedCandidates = features
    .map((feature) => {
      const normalizedFeatureName = normalizeCircuitKey(feature.properties?.Name ?? "");
      const matchesAllTokens = idTokens.every((token) => normalizedFeatureName.includes(token));

      if (!matchesAllTokens) {
        return null;
      }

      let score = idTokens.length * 10;

      if (normalizedFeatureName.startsWith(`${normalizedId}-`)) {
        score += 20;
      }

      if (normalizedFeatureName.endsWith(`-${normalizedId}`)) {
        score += 20;
      }

      if (normalizedFeatureName.includes(`-${normalizedId}-`)) {
        score += 15;
      }

      return { feature, score };
    })
    .filter((candidate): candidate is { feature: CircuitFeature; score: number } => candidate !== null)
    .sort((left, right) => right.score - left.score);

  return rankedCandidates[0]?.feature ?? null;
}

function buildOutlinePath(coordinates: number[][]) {
  const xs = coordinates.map(([x]) => x);
  const ys = coordinates.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(maxX - minX, Number.EPSILON);
  const height = Math.max(maxY - minY, Number.EPSILON);
  const scale = (OUTLINE_MAX_DIMENSION - OUTLINE_PADDING * 2) / Math.max(width, height);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const viewBoxWidth = scaledWidth + OUTLINE_PADDING * 2;
  const viewBoxHeight = scaledHeight + OUTLINE_PADDING * 2;
  const offsetX = OUTLINE_PADDING;
  const offsetY = OUTLINE_PADDING;

  const path = coordinates
    .map(([x, y], index) => {
      const normalizedX = ((x - minX) * scale + offsetX).toFixed(2);
      const normalizedY = ((maxY - y) * scale + offsetY).toFixed(2);
      return `${index === 0 ? "M" : "L"} ${normalizedX} ${normalizedY}`;
    })
    .join(" ");

  return {
    viewBox: `0 0 ${viewBoxWidth.toFixed(2)} ${viewBoxHeight.toFixed(2)}`,
    path,
  };
}

export function resolveCircuitOutline({
  circuitId,
  circuitName,
}: CircuitOutlineLookupInput): CircuitOutlineData | null {
  const feature =
    (circuitId ? resolveFeatureByCircuitId(circuitId) : null) ??
    (circuitName ? resolveFeatureByNameVariant(circuitName) : null);

  if (!feature?.geometry?.coordinates || !feature.properties?.Name) {
    return null;
  }

  return {
    name: feature.properties.Name,
    ...buildOutlinePath(feature.geometry.coordinates),
  };
}
