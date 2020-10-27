/*
    This file is part of ERC725.js.
    ERC725.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    ERC725.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file dataSrouce/glqApollo.js
 * @author Fabian Vogelsteller <fabian@lukso.network>, Robert McLeod <@robertdavid010>
 * @date 2020
 */

/*
  This file will handle querying the graphql sever
  in accordance with implementation of datastore in subgraph definition
  TODO: Add link to subgraph definition
*/
import { ApolloClient, InMemoryCache, createHttpLink, gql, NormalizedCacheObject } from '@apollo/client';

// TODO: Handle passing of 'provider' to set uri from main class
const apolloClient = new ApolloClient({
  uri: "http://localhost:8000/subgraphs/name/robertdavid010/test-subgraph-4",
  cache: new InMemoryCache(),
  fetchOptions: {
    mode: 'no-cors'
  }
})

function cleanOptions(options) {
  /** NOTE: We are translating skip/first to offset/limit as per more normal conventions
  // options fieds supported
  @param offset: @type int @description 'initial offest'
  @param limit: @type int @description 'number or results to return'
  @param orderBy: @type string @description 'field to order by'
  @param orderDirection: @type enum @description 'direction to order by, either "asc" or "desc"'
  */
  const opts = {}
  opts.skip = options && options.offset || null,
  opts.first = options && options.limit || null,
  opts.orderBy = options && options.orderBy || null,
  opts.orderDirection = options && options.orderDirection || null
  return opts
}

async function getAllEntities (options) {
  opts = cleanOptions(options)
  ERC725_QUERY = gql`
  {
    erc725S(skip:${opts.skip},first:${opts.first},orderBy:${opts.orderBy},orderDirection:${opts.orderDirection}) {
      id
      dataStore
    }
  }
  `
  return await apolloClient.query({ query: ERC725_QUERY })

}
async function getEntitiesList(entityIds, options) {
  opts = cleanOptions(options)
  let arrayStr = ""
  entityIds.forEach((e,i,a) => {
    arrayStr = arrayStr + "\"" + e + "\""
    arrayStr = i + 1 < a.length ? arrayStr + "," : arrayStr
  })
  ERC725_QUERY = gql`
  {
    erc725S(where:{id_in:[${arrayStr}]},skip:${opts.skip},first:${opts.first},orderBy:${opts.orderBy},orderDirection:${opts.orderDirection}) {
      id
      dataStore
    }
  }
  `
  return await apolloClient.query({ query: ERC725_QUERY })
}
async function getEntity (entityId) {
  const ERC725_QUERY = gql`
  {
    erc725(id:"${entityId}") {
      id
      dataStore
    }
  }
  `
  return await apolloClient.query({ query: ERC725_QUERY })
}

async function getDataByEntity (entityId) {
  // Get the ERC725 instance kv pairs
  const ERC725_DATA_QUERY = gql`
  {
    erc725DataStores (where:{erc725id:"${entityId}"}) {
      erc725id
      key
      value
      id
    }
  }
  `
  return await apolloClient.query({ query: ERC725_DATA_QUERY }) 
}

async function getEntityDataByKey(entityId, keyHash) {
  // Get ERC725 instance data (kv pairs) filtered by key
  const ERC725_DATA_QUERY = gql`
  {
    erc725DataStores (where:{erc725id:"${entityId}",key:"${keyHash}"}) {
      erc725id
      key
      value
      id
    }
  }
  `
  return await apolloClient.query({ query: ERC725_DATA_QUERY }) 
}

async function getDataByKey(keyHash) {
  // Get all data by key (multiple ERC725 instances possible)
  const ERC725_DATA_QUERY = gql`
  {
    erc725DataStores (where:{key:"${keyHash}"}) {
      erc725id
      key
      value
      id
    }
  }
  `
  return await apolloClient.query({ query: ERC725_DATA_QUERY }) 
}

export const ERC725Source = {
  getEntity,
  getEntitiesList,
  getAllEntities,
  getDataByEntity,
  getEntityDataByKey,
  getDataByKey
}