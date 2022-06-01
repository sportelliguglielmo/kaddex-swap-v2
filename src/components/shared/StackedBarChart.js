import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import { humanReadableNumber } from '../../utils/reduceBalance';
import { getTokenIconById } from '../../utils/token-utils';
import { CryptoContainer, FlexContainer } from './FlexContainer';
import Label from './Label';

const StackedBarChartContainer = styled(FlexContainer)`
  .recharts-surface {
    margin-left: -5px;
  }
  .recharts-yAxis,
  .recharts-xAxis,
  .recharts-cartesian-axis-line {
    display: none;
  }

  /* recharts-layer 
  recharts-cartesian-axis-tick
  recharts-cartesian-axis-tick-line 
  
  
  var shortLine = document.getElementById('ShortLine')
shortLine.y1.baseVal.value = 500
  */
  .recharts-text,
  .recharts-cartesian-axis-tick-value {
    fill: ${({ theme: { colors } }) => colors.white};
    font-family: ${({ theme: { fontFamily } }) => fontFamily.basier};
  }

  .recharts-cartesian-axis-tick {
    line {
      stroke: #ffffff;
    }
  }

  .recharts-cartesian-axis-ticks > :first-child,
  .recharts-cartesian-axis-ticks > :last-child {
    line {
      display: none;
    }
  }
`;

const TooltipContent = styled(FlexContainer)`
  background: ${({ theme: { colors } }) => colors.primary};
  padding: 16px;
  z-index: 1;
`;

const StackedBarChart = ({ title, rightComponent, data }) => {
  const [barOnHover, setBarOnHover] = useState('');

  const obj = data.reduce((res, item) => {
    res = { ...res, [item.name]: item.percentage };
    return res;
  }, {});

  const CustomTooltip = () => {
    const tokenInfo = data.find((token) => token.name === barOnHover);
    return tokenInfo ? (
      <TooltipContent gap={16} className="column">
        <div className="flex">
          <CryptoContainer size={24}>{getTokenIconById(tokenInfo.name)}</CryptoContainer>
          <Label>{tokenInfo.name}</Label>
        </div>
        <Label>{tokenInfo.percentage.toFixed(2)} %</Label>
        <Label>$ {humanReadableNumber(tokenInfo.volumeUsd)}</Label>
      </TooltipContent>
    ) : (
      <></>
    );
  };

  return (
    <StackedBarChartContainer gap={24} withGradient className="column background-fill w-100" style={{ padding: 32 }}>
      <div className="w-100 flex justify-sb">
        <Label fontSize={16}>{title}</Label>
        {rightComponent}
      </div>
      <ResponsiveContainer height={50} width={'100%'}>
        <BarChart layout="vertical" data={[obj]}>
          <YAxis type="category" dataKey="name" stroke="#FFFFFF" fontSize="12" width={0} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          {Object.keys(obj).map((item, index) => {
            return (
              <Bar
                onMouseEnter={() => {
                  setBarOnHover(item);
                }}
                key={index}
                dataKey={item}
                onMouseLeave={() => setBarOnHover('')}
                radius={index === 0 ? [10, 0, 0, 10] : index === data.length - 1 ? [0, 10, 10, 0] : [0, 0, 0, 0]}
                fill={data[index].color || '#A9AAB4'}
                stackId="a"
              />
            );
          })}
          <XAxis ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} height={0} dy={5} domain={['dataMin', '100']} type="number" />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex w-100">
        {data.map((item, index) => (
          <div className="flex align-fs" style={{ marginRight: 32, zIndex: -1 }}>
            <div style={{ width: 32, height: 16, borderRadius: 4, background: item.color || '#A9AAB4', marginRight: 8 }}></div>
            {getTokenIconById(item.name) && <CryptoContainer size={16}>{getTokenIconById(item.name)}</CryptoContainer>}
            <Label>
              {item.name} {item.percentage.toFixed(2)}%
            </Label>
          </div>
        ))}
      </div>
    </StackedBarChartContainer>
  );
};

export default StackedBarChart;