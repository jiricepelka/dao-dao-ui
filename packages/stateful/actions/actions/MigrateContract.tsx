import { useCallback, useMemo, useState } from 'react'
import { useRecoilValueLoadable } from 'recoil'

import { contractAdminSelector } from '@dao-dao/state'
import { MigrateContractEmoji } from '@dao-dao/stateless'
import {
  ActionComponent,
  ActionKey,
  ActionMaker,
  UseDecodedCosmosMsg,
  UseDefaults,
  UseTransformToCosmos,
} from '@dao-dao/types/actions'

import { MigrateContractComponent as StatelessMigrateContractComponent } from '../components/MigrateContract'

interface MigrateData {
  contract: string
  codeId: number
  msg: string
}

const useDefaults: UseDefaults<MigrateData> = () => ({
  contract: '',
  codeId: 0,
  msg: '{}',
})

const useTransformToCosmos: UseTransformToCosmos<MigrateData> = () =>
  useCallback(
    ({ contract: contract_addr, codeId: new_code_id, msg }: MigrateData) => ({
      wasm: {
        migrate: {
          contract_addr,
          new_code_id,
          msg: btoa(msg),
        },
      },
    }),
    []
  )

const useDecodedCosmosMsg: UseDecodedCosmosMsg<MigrateData> = (
  msg: Record<string, any>
) =>
  useMemo(
    () =>
      'wasm' in msg && 'migrate' in msg.wasm
        ? {
            match: true,
            data: {
              contract: msg.wasm.migrate.contract_addr,
              codeId: msg.wasm.migrate.new_code_id,
              msg: JSON.stringify(msg.wasm.migrate.msg),
            },
          }
        : { match: false },
    [msg]
  )

export const makeMigrateAction: ActionMaker<MigrateData> = ({ t }) => {
  const Component: ActionComponent = (props) => {
    const [contract, setContract] = useState('')

    const admin = useRecoilValueLoadable(
      contractAdminSelector({ contractAddress: contract })
    )

    return (
      <StatelessMigrateContractComponent
        {...props}
        options={{
          contractAdmin:
            admin.state === 'hasValue' ? admin.getValue() : undefined,
          onContractChange: (contract: string) => setContract(contract),
        }}
      />
    )
  }

  return {
    key: ActionKey.Migrate,
    Icon: MigrateContractEmoji,
    label: t('title.migrateSmartContract'),
    description: t('info.migrateSmartContractActionDescription'),
    Component,
    useDefaults,
    useTransformToCosmos,
    useDecodedCosmosMsg,
  }
}
