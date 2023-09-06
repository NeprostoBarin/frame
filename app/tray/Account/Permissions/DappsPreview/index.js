import React from 'react'
import link from '../../../../../resources/link'
import svg from '../../../../../resources/svg'
import { matchFilter } from '../../../../../resources/utils'
import useStore from '../../../../../resources/Hooks/useStore'
import useAccountModule from '../../../../../resources/Hooks/useAccountModule'

import DappsList from '../DappsList'

const DappsPreview = ({ filter = '', moduleId, account }) => {
  const [moduleRef] = useAccountModule(moduleId)
  const permissions = useStore('main.permissions', account) || {}
  let permissionList = Object.keys(permissions)
    .filter((o) => {
      return matchFilter(filter, [permissions[o].origin])
    })
    .sort((a, b) => (a.origin < b.origin ? -1 : 1))
    .slice(0, 4)

  return (
    <div className='balancesBlock' ref={moduleRef}>
      <div className='moduleHeader'>
        <span>{svg.window(14)}</span>
        <span>{'Dapps'}</span>
      </div>
      <DappsList moduleId={moduleId} permissionList={permissionList} account={account} />
      <div className='signerBalanceTotal'>
        <div className='signerBalanceButtons'>
          <div
            className='signerBalanceButton signerBalanceShowAll'
            onClick={() => {
              const crumb = {
                view: 'expandedModule',
                data: {
                  id: moduleId,
                  account: account
                }
              }
              link.send('nav:forward', 'panel', crumb)
            }}
          >
            More
          </div>
        </div>
      </div>
    </div>
  )
}

export default DappsPreview
