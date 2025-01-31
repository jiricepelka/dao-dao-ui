import { selectorFamily } from 'recoil'

import { WithChainId } from '@dao-dao/types'
import {
  AllAccountsResponse,
  AllAllowancesResponse,
  AllowanceResponse,
  BalanceResponse,
  DownloadLogoResponse,
  MarketingInfoResponse,
  MinterResponse,
  TokenInfoResponse,
} from '@dao-dao/types/contracts/Cw20Base'

import { Cw20BaseClient, Cw20BaseQueryClient } from '../../../clients/Cw20Base'
import {
  refreshWalletBalancesIdAtom,
  signingCosmWasmClientAtom,
} from '../../atoms'
import { cosmWasmClientForChainSelector } from '../chain'

type QueryClientParams = WithChainId<{
  contractAddress: string
}>

const queryClient = selectorFamily<Cw20BaseQueryClient, QueryClientParams>({
  key: 'cw20BaseQueryClient',
  get:
    ({ contractAddress, chainId }) =>
    ({ get }) => {
      const client = get(cosmWasmClientForChainSelector(chainId))
      return new Cw20BaseQueryClient(client, contractAddress)
    },
})

export type ExecuteClientParams = {
  contractAddress: string
  sender: string
}

export const executeClient = selectorFamily<
  Cw20BaseClient | undefined,
  ExecuteClientParams
>({
  key: 'cw20BaseExecuteClient',
  get:
    ({ contractAddress, sender }) =>
    ({ get }) => {
      const client = get(signingCosmWasmClientAtom)
      if (!client) return
      return new Cw20BaseClient(client, sender, contractAddress)
    },
  dangerouslyAllowMutability: true,
})

export const balanceSelector = selectorFamily<
  BalanceResponse,
  QueryClientParams & {
    params: Parameters<Cw20BaseQueryClient['balance']>
  }
>({
  key: 'cw20BaseBalance',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))
      get(refreshWalletBalancesIdAtom(params[0].address))
      return await client.balance(...params)
    },
})
export const tokenInfoSelector = selectorFamily<
  TokenInfoResponse,
  QueryClientParams & {
    params: Parameters<Cw20BaseQueryClient['tokenInfo']>
  }
>({
  key: 'cw20BaseTokenInfo',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))
      return await client.tokenInfo(...params)
    },
})
export const minterSelector = selectorFamily<
  MinterResponse,
  QueryClientParams & {
    params: Parameters<Cw20BaseQueryClient['minter']>
  }
>({
  key: 'cw20BaseMinter',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))
      return await client.minter(...params)
    },
})
export const allowanceSelector = selectorFamily<
  AllowanceResponse,
  QueryClientParams & {
    params: Parameters<Cw20BaseQueryClient['allowance']>
  }
>({
  key: 'cw20BaseAllowance',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))

      get(refreshWalletBalancesIdAtom(params[0].owner))

      return await client.allowance(...params)
    },
})
export const allAllowancesSelector = selectorFamily<
  AllAllowancesResponse,
  QueryClientParams & {
    params: Parameters<Cw20BaseQueryClient['allAllowances']>
  }
>({
  key: 'cw20BaseAllAllowances',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))

      get(refreshWalletBalancesIdAtom(params[0].owner))

      return await client.allAllowances(...params)
    },
})
export const allAccountsSelector = selectorFamily<
  AllAccountsResponse,
  QueryClientParams & {
    params: Parameters<Cw20BaseQueryClient['allAccounts']>
  }
>({
  key: 'cw20BaseAllAccounts',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))
      return await client.allAccounts(...params)
    },
})
export const marketingInfoSelector = selectorFamily<
  MarketingInfoResponse,
  QueryClientParams & {
    params: Parameters<Cw20BaseQueryClient['marketingInfo']>
  }
>({
  key: 'cw20BaseMarketingInfo',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))
      return await client.marketingInfo(...params)
    },
})
export const downloadLogoSelector = selectorFamily<
  DownloadLogoResponse,
  QueryClientParams & {
    params: Parameters<Cw20BaseQueryClient['downloadLogo']>
  }
>({
  key: 'cw20BaseDownloadLogo',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))
      return await client.downloadLogo(...params)
    },
})
