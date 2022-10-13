import { Check } from '@mui/icons-material'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import removeMarkdown from 'remove-markdown'

import {
  DaoCardPin,
  DaoCardProposals,
  Governance,
  ParentDaoArrow,
} from '@dao-dao/icons'
import { DaoCardProps } from '@dao-dao/tstypes/ui/DaoCard'
import { formatDate } from '@dao-dao/utils'

import { IconButton, IconButtonLink } from '../IconButton'
import { LinkWrapper } from '../LinkWrapper'
import { TokenAmountDisplay } from '../TokenAmountDisplay'
import { Tooltip } from '../Tooltip'
import { DaoImage } from './DaoImage'

export * from '@dao-dao/tstypes/ui/DaoCard'

export const DaoCard = ({
  coreAddress,
  name,
  description,
  imageUrl,
  established,
  pinned,
  onPin,
  parentDao,
  tokenSymbol,
  lazyData,
  showIsMember = true,
  className,
  onMouseOver,
  onMouseLeave,
}: DaoCardProps) => {
  const { t } = useTranslation()

  return (
    <LinkWrapper
      className={clsx(
        'relative flex h-[328px] w-full flex-col items-center justify-between rounded-md bg-background-secondary py-7 px-6 ring-1 ring-inset ring-transparent transition-all hover:bg-background-interactive-hover hover:ring-border-interactive-hover active:bg-background-interactive-pressed active:ring-border-interactive-focus',
        className
      )}
      href={`/dao/${coreAddress}`}
      onMouseLeave={onMouseLeave}
      onMouseOver={onMouseOver}
    >
      <div
        className={clsx(
          'absolute top-0 left-0 flex w-full flex-row items-center p-3',
          {
            'justify-between': !!parentDao,
            'justify-end': !parentDao, // Keep the pin and member check at the end if no parent DAO.
          }
        )}
      >
        {parentDao && (
          <IconButtonLink
            Icon={ParentDaoArrow}
            className="text-icon-interactive-disabled"
            href={`/dao/${parentDao.coreAddress}`}
            // Don't click on DAO card.
            onClick={(event) => event.preventDefault()}
            title={t('info.gotoParent')}
            variant="ghost"
          />
        )}
        <div className="flex flex-row items-center gap-3">
          <IconButton
            Icon={DaoCardPin}
            className={clsx({
              'text-icon-secondary': !pinned,
              'text-icon-interactive-active': pinned,
            })}
            onClick={(event) => {
              // Don't click on DAO card.
              event.preventDefault()
              onPin()
            }}
            variant="ghost"
          />

          {showIsMember && !lazyData.loading && lazyData.data.isMember && (
            <Tooltip title={t('info.youAreMember')}>
              <Check className="h-4 w-4 text-icon-secondary" />
            </Tooltip>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <DaoImage
          coreAddress={coreAddress}
          imageUrl={imageUrl}
          parentDao={parentDao}
          size="sm"
        />
        <p className="primary-text mt-2">{name}</p>
        {established && (
          <p className="caption-text mt-1">{formatDate(established)}</p>
        )}
      </div>

      <div className="self-stretch">
        <p className="secondary-text mb-5 w-full break-words line-clamp-3">
          {removeMarkdown(description)}
        </p>

        <div
          className={clsx(
            'caption-text mb-2 flex flex-row items-center gap-3 font-mono',
            lazyData.loading && 'animate-pulse'
          )}
        >
          <Governance className="h-4 w-3" />

          <TokenAmountDisplay
            amount={
              lazyData.loading
                ? { loading: true }
                : { loading: false, data: lazyData.data.tokenBalance }
            }
            maxDecimals={3}
            symbol={tokenSymbol}
          />
        </div>

        <div
          className={clsx(
            'caption-text flex flex-row items-center gap-3 font-mono',
            lazyData.loading && 'animate-pulse'
          )}
        >
          <DaoCardProposals className="h-4 w-3" />
          <p>
            {lazyData.loading
              ? '...'
              : t('info.numProposals', {
                  count: lazyData.data.proposalCount,
                })}
          </p>
        </div>
      </div>
    </LinkWrapper>
  )
}
