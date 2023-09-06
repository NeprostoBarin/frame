import React from 'react'
import link from '../../../../../resources/link'
import svg from '../../../../../resources/svg'
import { matchFilter } from '../../../../../resources/utils'
import useStore from '../../../../../resources/Hooks/useStore'
import useAccountModule from '../../../../../resources/Hooks/useAccountModule'

import { Cluster, ClusterRow, ClusterValue } from '../../../../../resources/Components/Cluster'

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
    <div className='balancesBlock' ref={moduleRef} style={{ fontSize: '14px' }}>
      <div className='moduleHeader'>
        <span>{svg.pulse(14)}</span>
        <span>{'Activity'}</span>
      </div>
      <div style={{ padding: '2px 20px' }}>{'received 20 eth'}</div>
      <div style={{ padding: '2px 20px' }}>{'sent 2 USDC'}</div>
      <div style={{ padding: '2px 20px' }}>{'approved permit'}</div>
      <div style={{ padding: '2px 20px' }}>{'connected to app.aave.com'}</div>
      <div style={{ padding: '2px 20px' }}>{'received 20 eth'}</div>
      <div style={{ padding: '2px 20px 20px' }}>{'received 20 eth'}</div>
    </div>
  )
}

export default DappsPreview
