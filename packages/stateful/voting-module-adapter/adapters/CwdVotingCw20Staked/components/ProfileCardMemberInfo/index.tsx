import { useWallet } from '@noahsaso/cosmodal'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import {
  Cw20StakeHooks,
  blockHeightSelector,
  blocksPerYearSelector,
  junoswapPoolsListSelector,
  stakingLoadingAtom,
  useAwaitNextBlock,
  useWalletProfile,
} from '@dao-dao/state'
import { useCachedLoadable, useDaoInfoContext } from '@dao-dao/stateless'
import {
  BaseProfileCardMemberInfoProps,
  UnstakingTask,
  UnstakingTaskStatus,
} from '@dao-dao/types'
import {
  NATIVE_DENOM,
  convertExpirationToDate,
  convertMicroDenomToDenomWithDecimals,
  durationToSeconds,
  nativeTokenLabel,
  processError,
} from '@dao-dao/utils'

import { ProfileCardMemberInfoTokens } from '../../../../components'
import { useGovernanceTokenInfo, useStakingInfo } from '../../hooks'
import { StakingModal } from './StakingModal'

export const ProfileCardMemberInfo = ({
  deposit,
  ...props
}: BaseProfileCardMemberInfoProps) => {
  const { t } = useTranslation()
  const { name: daoName } = useDaoInfoContext()
  const { address: walletAddress, connected } = useWallet()
  const { refreshBalances } = useWalletProfile()

  const [showStakingModal, setShowStakingModal] = useState(false)
  const [claimingLoading, setClaimingLoading] = useState(false)
  const stakingLoading = useRecoilValue(stakingLoadingAtom)

  const {
    governanceTokenAddress,
    governanceTokenInfo,
    walletBalance: unstakedBalance,
  } = useGovernanceTokenInfo({
    fetchWalletBalance: true,
  })

  const {
    stakingContractAddress,
    unstakingDuration,
    refreshTotals,
    claimsPending,
    claimsAvailable,
    sumClaimsAvailable,
    walletStakedValue,
    totalStakedValue,
    refreshClaims,
  } = useStakingInfo({
    fetchClaims: true,
    fetchWalletStakedValue: true,
    fetchTotalStakedValue: true,
  })

  if (
    claimsPending === undefined ||
    claimsAvailable === undefined ||
    sumClaimsAvailable === undefined ||
    unstakedBalance === undefined ||
    walletStakedValue === undefined ||
    totalStakedValue === undefined
  ) {
    throw new Error(t('error.loadingData'))
  }

  // Search for governance token in junoswap pools list.
  const poolsList = useRecoilValue(junoswapPoolsListSelector)
  const governanceTokenPoolSymbol = poolsList?.pools
    .flatMap(({ pool_assets }) => pool_assets)
    .find(
      ({ token_address }) => governanceTokenAddress === token_address
    )?.symbol

  const doClaim = Cw20StakeHooks.useClaim({
    contractAddress: stakingContractAddress,
    sender: walletAddress ?? '',
  })

  const awaitNextBlock = useAwaitNextBlock()
  const onClaim = useCallback(async () => {
    if (!connected) {
      return toast.error(t('error.connectWalletToContinue'))
    }
    if (sumClaimsAvailable === 0) {
      return toast.error(t('error.noClaimsAvailable'))
    }

    setClaimingLoading(true)
    try {
      await doClaim()

      // New balances will not appear until the next block.
      await awaitNextBlock()

      refreshBalances()
      refreshTotals()
      refreshClaims?.()

      toast.success(
        `Claimed ${convertMicroDenomToDenomWithDecimals(
          sumClaimsAvailable,
          governanceTokenInfo.decimals
        ).toLocaleString(undefined, {
          maximumFractionDigits: governanceTokenInfo.decimals,
        })} $${governanceTokenInfo.symbol}`
      )
    } catch (err) {
      console.error(err)
      toast.error(processError(err))
    } finally {
      setClaimingLoading(false)
    }
  }, [
    awaitNextBlock,
    connected,
    doClaim,
    governanceTokenInfo.decimals,
    governanceTokenInfo.symbol,
    refreshBalances,
    refreshClaims,
    refreshTotals,
    sumClaimsAvailable,
    t,
  ])

  const blockHeightLoadable = useCachedLoadable(blockHeightSelector({}))
  const blocksPerYear = useRecoilValue(blocksPerYearSelector({}))

  const unstakingTasks: UnstakingTask[] = [
    ...claimsPending.map(({ amount, release_at }) => ({
      status: UnstakingTaskStatus.Unstaking,
      amount: convertMicroDenomToDenomWithDecimals(
        amount,
        governanceTokenInfo.decimals
      ),
      tokenSymbol: governanceTokenInfo.symbol,
      tokenDecimals: governanceTokenInfo.decimals,
      date: convertExpirationToDate(
        blocksPerYear,
        release_at,
        blockHeightLoadable.state === 'hasValue'
          ? blockHeightLoadable.contents
          : 0
      ),
    })),
    ...claimsAvailable.map(({ amount, release_at }) => ({
      status: UnstakingTaskStatus.ReadyToClaim,
      amount: convertMicroDenomToDenomWithDecimals(
        amount,
        governanceTokenInfo.decimals
      ),
      tokenSymbol: governanceTokenInfo.symbol,
      tokenDecimals: governanceTokenInfo.decimals,
      date: convertExpirationToDate(
        blocksPerYear,
        release_at,
        blockHeightLoadable.state === 'hasValue'
          ? blockHeightLoadable.contents
          : 0
      ),
    })),
  ]

  return (
    <>
      {showStakingModal && (
        <StakingModal
          maxDeposit={deposit}
          onClose={() => setShowStakingModal(false)}
        />
      )}

      <ProfileCardMemberInfoTokens
        claimingLoading={claimingLoading}
        daoName={daoName}
        junoswapHref={
          governanceTokenPoolSymbol
            ? `https://junoswap.com/?from=${nativeTokenLabel(
                NATIVE_DENOM
              )}&to=${governanceTokenPoolSymbol}`
            : undefined
        }
        onClaim={onClaim}
        onStake={() => setShowStakingModal(true)}
        refreshUnstakingTasks={() => refreshClaims?.()}
        stakedTokens={convertMicroDenomToDenomWithDecimals(
          walletStakedValue,
          governanceTokenInfo.decimals
        )}
        stakingLoading={stakingLoading}
        tokenDecimals={governanceTokenInfo.decimals}
        tokenSymbol={governanceTokenInfo.symbol}
        unstakedTokens={convertMicroDenomToDenomWithDecimals(
          unstakedBalance,
          governanceTokenInfo.decimals
        )}
        unstakingDurationSeconds={
          (unstakingDuration &&
            durationToSeconds(blocksPerYear, unstakingDuration)) ||
          undefined
        }
        unstakingTasks={unstakingTasks}
        votingPower={(walletStakedValue / totalStakedValue) * 100}
        {...props}
      />
    </>
  )
}
