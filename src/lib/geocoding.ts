export interface GeocodingResult {
  lat: number
  lng: number
  displayName: string
  address: {
    city?: string
    state?: string
    country?: string
    countryCode?: string
  }
  elevation?: number
}

export async function searchLocation(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}&` +
      `format=json&` +
      `addressdetails=1&` +
      `limit=5`,
      {
        headers: {
          'User-Agent': 'GlobalUAPMap/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }

    const data = await response.json()

    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      address: {
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        country: item.address?.country,
        countryCode: item.address?.country_code
      }
    }))
  } catch (error) {
    console.error('Geocoding error:', error)
    return []
  }
}

export async function getElevation(lat: number, lng: number): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      return data.results[0].elevation
    }

    return null
  } catch (error) {
    console.error('Elevation API error:', error)
    return null
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${lat}&` +
      `lon=${lng}&` +
      `format=json&` +
      `addressdetails=1`,
      {
        headers: {
          'User-Agent': 'GlobalUAPMap/1.0'
        }
      }
    )

    if (!response.ok) {
      return null
    }

    const item = await response.json()

    return {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      address: {
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        country: item.address?.country,
        countryCode: item.address?.country_code
      }
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}
