import type { LoaderClient, LoaderKey } from 'salo'
import { ClientContext } from './client-context'

interface ClientProviderProps<Data, Key extends LoaderKey> {
  client: LoaderClient<Data, Key>
}

export const ClientProvider = <Data, Key extends LoaderKey>({
  client,
}: ClientProviderProps<Data, Key>) => <ClientContext.Provider value={client} />
