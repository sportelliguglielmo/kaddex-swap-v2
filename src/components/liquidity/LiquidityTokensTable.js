import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getDailyVolume } from '../../api/kaddex-stats';
import { getPairList } from '../../api/pact-pair';
import CommonTable from '../shared/CommonTable';
import tokenData from '../../constants/cryptoCurrencies';
import { humanReadableNumber, reduceBalance } from '../../utils/reduceBalance';
import AppLoader from '../shared/AppLoader';
import { AddIcon, GasIcon } from '../../assets';
import { ROUTE_LIQUIDITY_ADD_LIQUIDITY_SINGLE_SIDED, ROUTE_LIQUIDITY_TOKENS } from '../../router/routes';
import { CryptoContainer, FlexContainer } from '../shared/FlexContainer';
import Label from '../shared/Label';
import { get24HVolumeSingleSided, getAllPairValues, getTokenUsdPrice } from '../../utils/token-utils';
const LiquidityTokensTable = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);

  const fetchData = async () => {
    const pairsList = await getPairList();
    const volumes = await getDailyVolume();

    const tokens = Object.values(tokenData);

    // get all aprs from pairs list
    const aprs = (await getAllPairValues(pairsList, volumes)).map((pair) => pair.apr);
    const result = [];

    // calculate sum of liquidity in usd and volumes in usd for each token in each pair
    for (const token of tokens) {
      const tokenPairs = pairsList.filter((p) => p.token0 === token.name || p.token1 === token.name);
      const tokenUsdPrice = await getTokenUsdPrice(token, pairsList);
      let volume24HUsd = 0;
      let volume24H = 0;
      let liquidity = 0;
      for (const tokenPair of tokenPairs) {
        volume24H += get24HVolumeSingleSided(volumes, token.tokenNameKaddexStats);
        volume24HUsd += volume24H * tokenUsdPrice;
        liquidity += token.name === tokenPair.token0 ? reduceBalance(tokenPair.reserves[0]) : reduceBalance(tokenPair.reserves[1]);
      }

      const liquidityUSD = tokenUsdPrice ? liquidity * tokenUsdPrice : null;

      // filter all apr that contains the token in at least one side of the pair
      const filteredApr = aprs.filter((a) => a.token0 === token.name || a.token1 === token.name);
      // get the highest apr for filtered apr
      const highestApr = Math.max([...filteredApr].map((apr) => apr.value));

      result.push({ ...token, volume24HUsd, volume24H, apr: highestApr, liquidityUSD, liquidity });
    }
    setTokens(result);
    setLoading(false);
  };
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, []);

  return !loading ? (
    <CommonTable
      items={tokens}
      columns={renderColumns()}
      actions={[
        {
          icon: <AddIcon />,
          onClick: (item) => {
            console.log('item.token0', item);
            history.push(ROUTE_LIQUIDITY_ADD_LIQUIDITY_SINGLE_SIDED.concat(`?token0=${item.name}`), {
              from: ROUTE_LIQUIDITY_TOKENS,
            });
          },
        },
      ]}
    />
  ) : (
    <AppLoader containerStyle={{ height: '100%', alignItems: 'center', justifyContent: 'center' }} />
  );
};

export default LiquidityTokensTable;

const renderColumns = () => {
  return [
    {
      name: 'name',
      width: 160,
      render: ({ item }) => (
        <FlexContainer className="align-ce">
          <CryptoContainer style={{ zIndex: 2 }}> {tokenData[item.name].icon}</CryptoContainer>
          {item.name}
        </FlexContainer>
      ),
    },
    {
      name: 'liquidity',
      width: 160,

      render: ({ item }) => {
        if (item.liquidityUSD) {
          return `$ ${humanReadableNumber(item.liquidityUSD)}`;
        }
        return humanReadableNumber(item.liquidity);
      },
    },
    {
      name: '24h Volume',
      width: 160,
      render: ({ item }) => {
        if (item.volume24HUsd) {
          return `$ ${humanReadableNumber(item.volume24HUsd)}`;
        }
        return humanReadableNumber(item.volume24H);
      },
    },

    {
      name: 'Fees',
      width: 160,
      render: () => (
        <FlexContainer className="align-ce">
          <GasIcon />
          <Label fontSize={13} color="#41CC41" labelStyle={{ marginLeft: 12 }}>
            Gasless
          </Label>
        </FlexContainer>
      ),
    },

    {
      name: 'APR Booster',
      width: 160,
      render: ({ item }) => 'Coming Soon',
    },
    {
      name: 'APR',
      width: 160,
      render: ({ item }) => `${item.apr.toFixed(2)} %`,
    },
  ];
};