import { createContext, useContext } from 'react'
import { createLoaderClient } from 'salo'
import type { LoaderClient, LoaderKey } from 'salo'

const defaultLoaderClient = createLoaderClient<any, any>()
const LoaderClientContext = createContext(defaultLoaderClient)

export const useClient = <Data, Key extends LoaderKey>() =>
  useContext<LoaderClient<Data, Key>>(LoaderClientContext)
