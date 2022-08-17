import React from 'react'
import Restore from 'react-restore'
import link from '../../../../../../../resources/link'
import svg from '../../../../../../../resources/svg'
import utils from 'web3-utils'

import BigNumber from 'bignumber.js'

class TxRecipient extends React.Component {
  constructor (...args) {
    super(...args)
    this.state = {
      copied: false
    }
  }
  copyAddress (data) {
    link.send('tray:clipboardData', data)
    this.setState({ copied: true })
    setTimeout(_ => this.setState({ copied: false }), 1000)
  }
  hexToDisplayValue (hex) {
    return (Math.round(parseFloat(utils.fromWei(hex, 'ether')) * 1000000) / 1000000).toFixed(6)
  }

  renderRecog (req) {
    if (req && req.recog && req.recog.type === 'erc20:transfer') {
      const { data } = req.recog
      const amount = new BigNumber(data.amount) 
      const decimals = new BigNumber('1e' + data.decimals)
      const displayAmount = amount.dividedBy(decimals)

      return (
        <>
          <div className='_txDescriptionSummaryLine'>
            {`Sending ${displayAmount.toFixed(9)} ${data.symbol}`}
          </div>
          <div className='_txDescriptionSummaryLine'>
            {`To: ${data.recipient}`}
          </div>
        </>
      )
    }
  }

  render () {
    const req = this.props.req
    const chainId = parseInt(req.data.chainId, 16)

    const chainName = this.store('main.networks.ethereum', chainId, 'name')
    const currentSymbol = this.store('main.networks.ethereum', chainId, 'symbol') || '?'

    const txMeta = { replacement: false, possible: true, notice: '' }
    // TODO
    // if (signer locked) {
    //   txMeta.possible = false
    //   txMeta.notice = 'signer is locked'
    // }
    if (req.data.nonce) {
      const r = this.store('main.accounts', this.props.accountId, 'requests')
      const requests = Object.keys(r || {}).map(key => r[key])
      const monitor = requests.filter(req => req.mode === 'monitor')
      const monitorFilter = monitor.filter(r => r.status !== 'error')
      const existingNonces = monitorFilter.map(m => m.data.nonce)
      existingNonces.forEach((nonce, i) => {
        if (req.data.nonce === nonce) {
          txMeta.replacement = true
          if (monitorFilter[i].status === 'confirming' || monitorFilter[i].status === 'confirmed') {
            txMeta.possible = false
            txMeta.notice = 'nonce used'
          } else if (
            req.data.gasPrice &&
            parseInt(monitorFilter[i].data.gasPrice, 'hex') >= parseInt(req.data.gasPrice, 'hex')
          ) {
            txMeta.possible = false
            txMeta.notice = 'gas price too low'
          } else if (
              req.data.maxPriorityFeePerGas &&
              req.data.maxFeePerGas &&
              Math.ceil(parseInt(monitorFilter[i].data.maxPriorityFeePerGas, 'hex') * 1.1) > parseInt(req.data.maxPriorityFeePerGas, 'hex') &&
              Math.ceil(parseInt(monitorFilter[i].data.maxFeePerGas, 'hex') * 1.1) > parseInt(req.data.maxFeePerGas, 'hex')
            ) {
            txMeta.possible = false
            txMeta.notice = 'gas fees too low'
          }
        }
      })
    }

    return (
      <div className='_txMain' style={{ animationDelay: (0.1 * this.props.i) + 's' }}>
        <div className='_txMainInner'>
          <div className='_txMainValues'>
            {txMeta.replacement ? (
              txMeta.possible ? (
                <div className='_txMainTag _txMainTagWarning'>
                  valid replacement
                </div>
              ) : (
                <div className='_txMainTag _txMainTagWarning'>
                  {txMeta.notice || 'invalid duplicate'}
                </div>
              )
            ) : null}
            <div className='_txMainValue' >
              {txMeta.replacement ? (
                txMeta.possible ? (
                  <div className='approveRequestHeaderTag'>
                    valid replacement
                  </div>
                ) : (
                  <div className='approveRequestHeaderTag approveRequestHeaderTagInvalid'>
                    {txMeta.notice || 'invalid duplicate'}
                  </div>
                )
              ) : null}
                  
              <div className='_txDescription' onClick={() => {
                link.send('nav:update', 'panel', { step: 'viewData' })
              }}>
                {req.recipientType === 'external' ? (
                  <>
                    {req.data.value && req.data.value !== '0x' && req.data.value !== '0x0' ? (
                      <div>{`Sending ${currentSymbol}`}</div>
                    ) : null}
                    <div>{'to an external account'}</div>
                    <div>{`on ${chainName}`}</div>
                  </>
                ) : ( // Recipient is contract
                  <div className='_txDescriptionSummary'>
                    {req.data.value && req.data.value !== '0x' && req.data.value !== '0x0' ? (
                      <div>{`Sending ${currentSymbol}`}</div>
                    ) : null}
                    {req.data.data && req.data.data !== '0x' && req.data.data !== '0x0' ? (
                      req.recog ? (
                        this.renderRecog(req)
                      ) : req.decodedData && req.decodedData.method ? (
                        <div className='_txDescriptionSummaryLine'>
                          <span className={'_txDataValueMethod'}>{(() => {
                            if (req.decodedData.method.length > 17) return `${req.decodedData.method.substr(0, 15)}..`
                            return req.decodedData.method
                          })()}</span>
                          <span>{'via'}</span>
                          <span className={'_txDataValueMethod'}>{(() => {
                            if (req.decodedData.contractName.length > 11) return `${req.decodedData.contractName.substr(0, 9)}..`
                            return req.decodedData.contractName
                          })()}</span>
                        </div>
                      ) : (
                        <div>{'unknown action via unknown contract'}</div>
                      )
                    ) : null}
                    <div>{`on ${chainName}`}</div>
                  </div>
                )}
              </div>
            </div>
            {req.data.data && req.data.data !== '0x' && req.data.data !== '0x0' ? (
              <div className='_txMainTag _txMainTagWarning'>
                {'Transaction includes data'}
              </div>
            ) : null}
            {req.decodedData && req.decodedData.source ? (
              <div className='_txMainTag _txMainTagWarning'>
                {'abi source: ' + req.decodedData.source}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
}

{/* <div className='transactionToAddressFull' onMouseDown={this.copyAddress.bind(this, req.data.to)}>
{this.state.copied ? <span>{'Copied'}{svg.octicon('clippy', { height: 14 })}</span> : req.data.to}
</div> */}

export default Restore.connect(TxRecipient)
