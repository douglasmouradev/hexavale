import { AdService } from '@/services/ads/AdService'
import { mockAdProvider } from '@/services/ads/providers/MockAdProvider'

export const adService = new AdService(mockAdProvider)
