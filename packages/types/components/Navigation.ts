import { LoadingData } from './common'
import { DaoDropdownInfo } from './DaoDropdown'

export interface NavigationTokenPrice {
  label: string
  price: number
  priceDenom: string
  change?: number
}

export interface NavigationProps {
  setCommandModalVisible: () => void
  inboxCount: LoadingData<number>
  version: string
  tokenPrices: LoadingData<NavigationTokenPrice[]>
  pinnedDaos: LoadingData<DaoDropdownInfo[]>
  hideInbox?: boolean
  compact: boolean
  setCompact: (compact: boolean) => void
  mountedInBrowser: boolean
}
