import type { LoaderClient, LoaderKey } from 'salo'
import { useContext } from 'react'
import { LoaderClientContext } from './client-context'

export const useClient = <Data, Key extends LoaderKey>() =>
  useContext<LoaderClient<Data, Key>>(LoaderClientContext)
