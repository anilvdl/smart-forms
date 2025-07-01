import useSWR, { SWRResponse } from 'swr'

export interface FeatureFlag {
  key: string
  enabled: boolean
  // you can extend with min_plan_required, description, etc.
}

export interface UseFeatureFlagsResponse {
  flags: FeatureFlag[]
}

const fetcher = (url: string) =>
  fetch(url).then(async res => {
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Error fetching ${url}: ${res.status} – ${text}`)
    }
    return res.json()
  })

/**
 * useFeatureFlags
 *
 * Fetches the set of feature flags for the current org.
 *
 * @param orgId  the org to load flags for; if falsy, returns no data
 */
export function useFeatureFlags(
  orgId: string
): SWRResponse<UseFeatureFlagsResponse, Error> {
  const endpoint = orgId
    ? `/api/admin/feature-flags?orgId=${encodeURIComponent(orgId)}`
    : null

  return useSWR<UseFeatureFlagsResponse, Error>(
    endpoint,
    fetcher,
    { revalidateOnFocus: false }
  )
}