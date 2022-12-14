import React from 'react'

import link from '../../../../../../../resources/link'
import EnsOverview from '../../Ens'

import svg from '../../../../../../../resources/svg'

import { Cluster, ClusterRow, ClusterValue } from '../../../../../../../resources/Components/Cluster'
import { DisplayValue } from '../../../../../../../resources/Components/DisplayValue'

const isNonZeroHex = (hex) => !!hex && !['0x', '0x0'].includes(hex)

function renderRecognizedAction(req) {
  const { recognizedActions: actions = [] } = req

  return !actions.length ? (
    <div className='_txDescriptionSummaryLine'>Calling Contract</div>
  ) : (
    actions.map((action) => {
      const { id = '', data } = action

      const [actionClass, actionType] = id.split(':')

      if (actionClass === 'erc20') {
        if (actionType === 'transfer') {
          return <SendOverview amountHex={data.amount} decimals={data.decimals} symbol={data.symbol} />
        }
      } else if (actionClass === 'ens') {
        return <EnsOverview type={actionType} data={data} />
      } else {
        return <div className='_txDescriptionSummaryLine'>Calling Contract</div>
      }
    })
  )
}

const TxDescription = ({ chain, children, chainColor }) => (
  <div className='_txDescriptionSummary'>
    {children}
    <div className='_txDescriptionSummaryTag' style={{ color: `var(--${chainColor})` }}>
      {`on ${chain}`}
    </div>
  </div>
)

const SendOverview = ({ amountHex, decimals, symbol }) => {
  return (
    <div>
      <span>{'Send'}</span>
      <DisplayValue
        type='ether'
        value={amountHex}
        valueDataParams={{ decimals }}
        currencySymbol={symbol}
        currencySymbolPosition='last'
      />
    </div>
  )
}

const DeployContractOverview = () => <div>Deploying Contract</div>
const GenericContractOverview = ({ method }) => <div>{`Calling Contract Method ${method}`}</div>
const DataOverview = () => <div>Sending data</div>
const EmptyTransactionOverview = () => <div>Empty Transaction</div>

const TxOverview = ({ req, chainName, chainColor, symbol, originName, txMeta, simple, valueColor }) => {
  const { recipientType, decodedData: { method } = {}, data: tx = {} } = req
  const { to, value, data: calldata } = tx

  const isContractDeploy = !to && isNonZeroHex(calldata)
  const isSend = isNonZeroHex(value)
  const isContractCall = recipientType !== 'external'

  let description

  // TODO: empty vs unknown transactions

  if (isContractDeploy) {
    description = <DeployContractOverview />
  } else if (isContractCall) {
    description = renderRecognizedAction(req)

    if (!description && !!method) {
      description = <GenericContractOverview method={method} />
    }
  } else if (isSend) {
    description = <SendOverview amountHex={value} decimals={18} symbol={symbol} />
  } else if (isNonZeroHex(calldata)) {
    description = <DataOverview />
  }
  if (simple) {
    return (
      <div className='txDescriptionSummaryStandalone'>
        <span className='txDescriptionSummaryStandaloneWrap'>{description}</span>
      </div>
    )
  } else {
    return (
      <Cluster>
        <ClusterRow>
          <ClusterValue
            onClick={() => {
              link.send('nav:update', 'panel', { data: { step: 'viewData' } })
            }}
            style={{ background: valueColor }}
          >
            <div className='_txDescription'>
              <TxDescription chain={chainName} chainColor={chainColor}>
                <div className='requestItemTitleSub'>
                  <div className='requestItemTitleSubIcon'>{svg.window(10)}</div>
                  <div className='requestItemTitleSubText'>{originName}</div>
                </div>
                <div className='_txDescriptionSummaryMain'>{description}</div>
              </TxDescription>
            </div>
          </ClusterValue>
        </ClusterRow>
        {txMeta.replacement &&
          (txMeta.possible ? (
            <ClusterRow>
              <ClusterValue>
                <div className='_txMainTag _txMainTagWarning'>valid replacement</div>
              </ClusterValue>
            </ClusterRow>
          ) : (
            <ClusterRow>
              <ClusterValue>
                <div className='_txMainTag _txMainTagWarning'>{txMeta.notice || 'invalid duplicate'}</div>
              </ClusterValue>
            </ClusterRow>
          ))}
        {isNonZeroHex(calldata) && (
          <ClusterRow>
            <ClusterValue>
              <div className='_txMainTag _txMainTagWarning'>{'Transaction includes data'}</div>
            </ClusterValue>
          </ClusterRow>
        )}
      </Cluster>
    )
  }
}

export default TxOverview
