import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { UIMode, UserPersona } from '@smartforms/dynamic-app/lib/form-builder/schema'

export interface UserPreferences {
  persona: UserPersona
  ui_mode: UIMode
  default_grid_size: number
  show_grid_lines: boolean
  auto_save_enabled: boolean
  auto_save_interval: number
  favorite_components: string[]
  recent_components: string[]
  custom_shortcuts: Record<string, string>
  properties_panel_width: number
  component_panel_width: number
  canvas_zoom_level: number
}

const DEFAULT_PREFERENCES: UserPreferences = {
  persona: 'casual',
  ui_mode: 'recipe',
  default_grid_size: 12,
  show_grid_lines: true,
  auto_save_enabled: true,
  auto_save_interval: 30,
  favorite_components: [],
  recent_components: [],
  custom_shortcuts: {},
  properties_panel_width: 320,
  component_panel_width: 380,
  canvas_zoom_level: 100,
}

export function useUserPreferences() {
  const { data: session } = useSession()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load preferences
  useEffect(() => {
    if (!session?.user) {
      setLoading(false)
      return
    }

    const loadPreferences = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('>>> inside useUserPreferences.ts ----> calling /api/users/preferences...... ');

        const response = await fetch('/api/users/preferences', {
          credentials: 'include',
        })
        
        console.log(`response receivedd from /api/users/preferences: ${JSON.stringify(response)}`);

        if (!response.ok) {
          throw new Error('Failed to load preferences')
        }
        
        const data = await response.json()
        setPreferences({ ...DEFAULT_PREFERENCES, ...data })
      } catch (err) {
        console.error('Error loading preferences:', err)
        setError(err instanceof Error ? err.message : 'Failed to load preferences')
        // Use defaults on error
        setPreferences(DEFAULT_PREFERENCES)
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [session])

  // Update single preference
  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ [key]: value }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update preference')
      }
      
      setPreferences(prev => prev ? { ...prev, [key]: value } : null)
    } catch (err) {
      console.error('Error updating preference:', err)
      throw err
    }
  }, [session])

  // Update multiple preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }
      
      setPreferences(prev => prev ? { ...prev, ...updates } : null)
    } catch (err) {
      console.error('Error updating preferences:', err)
      throw err
    }
  }, [session])

  // Toggle UI mode
  const toggleUIMode = useCallback(async () => {
    if (!preferences) return
    
    const newMode: UIMode = preferences.ui_mode === 'traditional' ? 'recipe' : 'traditional'
    await updatePreference('ui_mode', newMode)
  }, [preferences, updatePreference])

  // Add to favorites
  const addFavoriteComponent = useCallback(async (componentId: string) => {
    if (!preferences) return
    
    const favorites = [...preferences.favorite_components]
    if (!favorites.includes(componentId)) {
      favorites.push(componentId)
      await updatePreference('favorite_components', favorites)
    }
  }, [preferences, updatePreference])

  // Remove from favorites
  const removeFavoriteComponent = useCallback(async (componentId: string) => {
    if (!preferences) return
    
    const favorites = preferences.favorite_components.filter(id => id !== componentId)
    await updatePreference('favorite_components', favorites)
  }, [preferences, updatePreference])

  // Track recent component usage
  const trackComponentUsage = useCallback(async (componentId: string) => {
    if (!preferences) return
    
    const recent = [...preferences.recent_components]
    // Remove if already exists
    const index = recent.indexOf(componentId)
    if (index > -1) {
      recent.splice(index, 1)
    }
    // Add to beginning
    recent.unshift(componentId)
    // Keep only last 10
    const trimmed = recent.slice(0, 10)
    
    await updatePreference('recent_components', trimmed)
  }, [preferences, updatePreference])

  return {
    preferences,
    loading,
    error,
    updatePreference,
    updatePreferences,
    toggleUIMode,
    addFavoriteComponent,
    removeFavoriteComponent,
    trackComponentUsage,
  }
}