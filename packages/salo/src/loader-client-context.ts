import { createContext, useContext } from 'react'
import { createLoaderClient } from './create-loader-client'
import type { LoaderClient, LoaderKey } from './types'

const defaultLoaderClient = createLoaderClient<any, any>()
const LoaderClientContext = createContext(defaultLoaderClient)

export const useLoaderClient = <Data, Key extends LoaderKey>() =>
  useContext<LoaderClient<Data, Key>>(LoaderClientContext)
