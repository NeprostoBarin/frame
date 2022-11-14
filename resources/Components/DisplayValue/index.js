import React from 'react'
import { displayValueData } from '../../utils/displayValue'

const CurrencySymbol = ({ symbol }) => <span className='currencySymbol'>{symbol}</span>

export const DisplayValue = ({ value, valueData, valueDataParams, currencySymbol, type = 'ether', decimalsOverride, currencySymbolPosition = 'first' }) => {
  const data = valueData || displayValueData(value, valueDataParams)
  const defaultDecimals = {
    ether: 6,
    fiat: 2
  }
  const { approximationSymbol = '', displayValue, displayUnit } = data[type](decimalsOverride === undefined ? defaultDecimals[type] : decimalsOverride)
  
  return <div className='displayValue'>
    <span className='approximation'>{approximationSymbol}</span>
    {currencySymbolPosition === 'first' && <CurrencySymbol symbol={currencySymbol} />}
    <span className='value'>{displayValue}</span>
    <span className='unit'>{displayUnit ? displayUnit.shortName : ''}</span>
    {currencySymbolPosition === 'last' && <CurrencySymbol symbol={currencySymbol} />}
  </div>
}
