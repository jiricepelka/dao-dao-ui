import { WalletConnectionStatus, useWallet } from '@noahsaso/cosmodal'
import { ComponentType, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import {
  useWalletProfile,
  walletStargazeNftCardInfosSelector,
} from '@dao-dao/state'
import {
  Loader as DefaultLoader,
  LoaderProps,
  Modal,
  ModalProps,
  NftSelectionModal,
  ProfileImage,
  useCachedLoadable,
} from '@dao-dao/stateless'
import { NftCardInfo } from '@dao-dao/types'
import {
  STARGAZE_CHAIN_ID,
  loadableToLoadingDataWithError,
  processError,
} from '@dao-dao/utils'

import { SuspenseLoader } from './SuspenseLoader'

export interface PfpkNftSelectionModalProps
  extends Pick<Required<ModalProps>, 'onClose'> {
  Loader?: ComponentType<LoaderProps>
}

export const InnerPfpkNftSelectionModal = ({
  onClose,
  Loader = DefaultLoader,
}: PfpkNftSelectionModalProps) => {
  const { t } = useTranslation()
  const {
    address: stargazeWalletAddress,
    status: stargazeConnectionStatus,
    error: stargazeConnectionError,
  } = useWallet(STARGAZE_CHAIN_ID)

  const getIdForNft = (nft: NftCardInfo) =>
    `${nft.collection.address}:${nft.tokenId}`

  const nfts = loadableToLoadingDataWithError(
    useCachedLoadable(
      stargazeWalletAddress
        ? walletStargazeNftCardInfosSelector(stargazeWalletAddress)
        : undefined
    )
  )

  const {
    walletProfile,
    updateProfileNft,
    updatingProfile,
    backupProfileImage,
  } = useWalletProfile()
  // Initialize to selected NFT.
  const [selected, setSelected] = useState<string | undefined>(
    !walletProfile.loading && walletProfile.data.nft
      ? `${walletProfile.data.nft.collectionAddress}:${walletProfile.data.nft.tokenId}`
      : undefined
  )
  const selectedNft =
    !nfts.loading && !nfts.errored && selected
      ? nfts.data.find((nft) => selected === getIdForNft(nft))
      : undefined
  // If nonce changes, set selected NFT.
  const [lastNonce, setLastNonce] = useState(
    walletProfile.loading ? 0 : walletProfile.data.nonce
  )
  useEffect(() => {
    if (
      !walletProfile.loading &&
      walletProfile.data.nft &&
      walletProfile.data.nonce > lastNonce
    ) {
      setSelected(
        `${walletProfile.data.nft.collectionAddress}:${walletProfile.data.nft.tokenId}`
      )
      setLastNonce(walletProfile.data.nonce)
    }
  }, [walletProfile, lastNonce])

  const onAction = useCallback(async () => {
    if (nfts.loading) {
      toast.error(t('error.noNftsSelected'))
      return
    }

    // Only give error about no NFTs if something should be selected. This
    // should never happen...
    if (selected && !selectedNft) {
      toast.error(t('error.noNftsSelected'))
      return
    }

    try {
      // Update NFT only.
      await updateProfileNft(
        selectedNft
          ? {
              chainId: STARGAZE_CHAIN_ID,
              collectionAddress: selectedNft.collection.address,
              tokenId: selectedNft.tokenId,
            }
          : // Clear NFT if nothing selected.
            null
      )
      // Close on successful update.
      onClose()
    } catch (err) {
      console.error(err)
      toast.error(processError(err))
    }
  }, [nfts, selected, selectedNft, t, updateProfileNft, onClose])

  return (
    <NftSelectionModal
      Loader={Loader}
      actionLabel={t('button.save')}
      actionLoading={updatingProfile}
      allowSelectingNone
      getIdForNft={getIdForNft}
      header={{
        title: t('title.chooseNftProfilePicture'),
        subtitle: t('info.chooseNftProfilePictureSubtitle'),
      }}
      nfts={
        stargazeConnectionStatus === WalletConnectionStatus.Errored
          ? { loading: false, errored: true, error: stargazeConnectionError }
          : nfts
      }
      onAction={onAction}
      onClose={onClose}
      onNftClick={(nft) =>
        setSelected(
          selected === getIdForNft(nft) ? undefined : getIdForNft(nft)
        )
      }
      selectedDisplay={
        <ProfileImage
          imageUrl={
            !nfts.loading
              ? selectedNft
                ? selectedNft.imageUrl
                : backupProfileImage
              : undefined
          }
          loading={nfts.loading}
          size="sm"
        />
      }
      selectedIds={selected ? [selected] : []}
    />
  )
}

export const PfpkNftSelectionModal = ({
  Loader = DefaultLoader,
  ...props
}: PfpkNftSelectionModalProps) => (
  <SuspenseLoader
    fallback={
      <Modal containerClassName="!p-40" visible {...props}>
        <Loader />
      </Modal>
    }
  >
    <InnerPfpkNftSelectionModal {...props} />
  </SuspenseLoader>
)
