import type { LoaderClient, LoaderKey } from 'salo'
import { useContext } from 'react'
import { ClientContext } from './client-context'

export const useClient = <Data, Key extends LoaderKey>() =>
  useContext<LoaderClient<Data, Key>>(ClientContext)
