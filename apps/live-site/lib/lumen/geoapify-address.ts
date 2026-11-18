/** Geoapify geocode autocomplete — credit-card KYC address only. */

export type GeoapifyFeatureProperties = {
  name?: string
  housenumber?: string
  street?: string
  city?: string
  town?: string
  village?: string
  suburb?: string
  county?: string
  state?: string
  state_code?: string
  postcode?: string
  country?: string
  country_code?: string
  formatted?: string
  address_line1?: string
  address_line2?: string
  result_type?: string
}

export type GeoapifyFeature = {
  type: 'Feature'
  properties: GeoapifyFeatureProperties
  geometry?: { type: string; coordinates: [number, number] }
}

export type GeoapifyAutocompleteResponse = {
  type: 'FeatureCollection'
  features: GeoapifyFeature[]
}

export type AddressSuggestion = {
  id: string
  label: string
  addressLine1: string
  city: string
  state: string
  postalCode: string
}

function featureId(feature: GeoapifyFeature, index: number) {
  const p = feature.properties
  return `${p.formatted ?? p.name ?? 'place'}-${index}`
}

/** Map a Geoapify hit into billing KYC address fields. */
export function suggestionFromFeature(
  feature: GeoapifyFeature,
  index: number,
): AddressSuggestion {
  const p = feature.properties
  const streetLine = [p.housenumber, p.street].filter(Boolean).join(' ').trim()
  const addressLine1 =
    streetLine ||
    p.address_line1?.trim() ||
    p.name?.trim() ||
    ''

  return {
    id: featureId(feature, index),
    label: p.formatted?.trim() || [addressLine1, p.city, p.state].filter(Boolean).join(', '),
    addressLine1,
    city: (p.city || p.town || p.village || '').trim(),
    state: (p.state_code || p.state || '').trim(),
    postalCode: (p.postcode || '').trim(),
  }
}
