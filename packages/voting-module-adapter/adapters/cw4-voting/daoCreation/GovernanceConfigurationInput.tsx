import { Add } from '@mui/icons-material'
import { useWallet } from '@noahsaso/cosmodal'
import cloneDeep from 'lodash.clonedeep'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { DaoCreationGovernanceConfigInputProps } from '@dao-dao/tstypes'
import {
  Button,
  ChartDataEntry,
  DaoCreateVotingPowerDistributionBarChart,
  InputErrorMessage,
  VOTING_POWER_DISTRIBUTION_COLORS,
} from '@dao-dao/ui'

import { Cw4VotingAdapter } from '../../../index'
import { DaoCreationConfig } from '../types'
import { TierCard } from './TierCard'

export const GovernanceConfigurationInput = ({
  data,
  context: {
    form: {
      control,
      formState: { errors },
      register,
      setValue,
    },
  },
}: DaoCreationGovernanceConfigInputProps<DaoCreationConfig>) => {
  const { t } = useTranslation()
  const { address: walletAddress } = useWallet()

  const {
    fields: tierFields,
    append: appendTier,
    remove: removeTier,
  } = useFieldArray({
    control,
    name: 'votingModuleAdapter.data.tiers',
  })

  const addTierRef = useRef<HTMLButtonElement>(null)
  const addTier = useCallback(() => {
    appendTier(cloneDeep(Cw4VotingAdapter.daoCreation!.defaultConfig.tiers[0]))
    // Scroll button to bottom of screen.
    addTierRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [appendTier])

  // Fill in default first tier info if tiers not yet edited.
  const [loadedPage, setLoadedPage] = useState(false)
  useEffect(() => {
    if (loadedPage) return
    setLoadedPage(true)

    if (
      !(
        data.tiers.length === 1 &&
        data.tiers[0].name === '' &&
        data.tiers[0].members.length === 1 &&
        data.tiers[0].members[0].address === ''
      )
    )
      return

    setValue('votingModuleAdapter.data.tiers.0.name', t('form.defaultTierName'))
    if (walletAddress) {
      setValue(
        'votingModuleAdapter.data.tiers.0.members.0.address',
        walletAddress
      )
    }
  }, [data.tiers, loadedPage, setValue, t, walletAddress])

  //! Bar chart data

  const totalWeight = data.tiers.reduce(
    // Multiply by member count since the tier's weight applies to each member.
    (acc, { weight, members }) => acc + weight * members.length,
    0
  )

  const barData: ChartDataEntry[] =
    tierFields.length === 1
      ? data.tiers[0].members.map(({ address }, memberIndex) => ({
          name: address.trim() || t('form.membersAddress'),
          // Membership-based DAO tier weights are the same for each member.
          value: (data.tiers[0].weight / totalWeight) * 100,
          color:
            VOTING_POWER_DISTRIBUTION_COLORS[
              memberIndex % VOTING_POWER_DISTRIBUTION_COLORS.length
            ],
        }))
      : data.tiers.map(({ name, weight, members }, tierIndex) => ({
          name: name.trim() || t('title.tierNum', { tier: tierIndex + 1 }),
          value: ((weight * members.length) / totalWeight) * 100,
          color:
            VOTING_POWER_DISTRIBUTION_COLORS[
              tierIndex % VOTING_POWER_DISTRIBUTION_COLORS.length
            ],
        }))

  return (
    <>
      <div style={{ height: (tierFields.length + 2) * 50 }}>
        <DaoCreateVotingPowerDistributionBarChart data={barData} />
      </div>

      <div className="flex flex-col gap-4 items-stretch mt-16">
        {tierFields.map(({ id }, idx) => (
          <TierCard
            key={id}
            control={control}
            data={data}
            errors={errors}
            register={register}
            remove={tierFields.length === 1 ? undefined : () => removeTier(idx)}
            setValue={setValue}
            showColorDotOnMember={tierFields.length === 1}
            tierIndex={idx}
          />
        ))}

        <div className="flex flex-col">
          <Button
            className="self-start"
            onClick={addTier}
            ref={addTierRef}
            variant="secondary"
          >
            <Add className="!w-6 !h-6 text-icon-primary" />
            <p>{t('button.addTier')}</p>
          </Button>

          <InputErrorMessage
            error={errors.votingModuleAdapter?.data?._tiersError}
          />
        </div>
      </div>
    </>
  )
}
