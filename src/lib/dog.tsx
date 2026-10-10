import { createContext, useContext, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Dog } from '../db/db'

interface Ctx { dog?: Dog; dogs: Dog[]; setDogId: (id: number) => void }
const DogCtx = createContext<Ctx>({ dogs: [], setDogId: () => {} })

export function DogProvider({ children, loading }: { children: (ready: boolean) => ReactNode; loading?: ReactNode }) {
  const dogs = useLiveQuery(() => db.dogs.toArray(), [])
  const [sel, setSel] = useState(() => Number(localStorage.getItem('pomly.dog')) || 0)
  if (!dogs) return <>{loading}</>
  const dog = dogs.find((d) => d.id === sel) ?? dogs[0]
  const setDogId = (id: number) => {
    localStorage.setItem('pomly.dog', String(id))
    setSel(id)
  }
  return <DogCtx.Provider value={{ dog, dogs, setDogId }}>{children(!!dog)}</DogCtx.Provider>
}

export const useDog = () => useContext(DogCtx)
/** The current dog; only use below the setup gate. */
export const useCurrentDog = () => useContext(DogCtx).dog as Dog & { id: number }
