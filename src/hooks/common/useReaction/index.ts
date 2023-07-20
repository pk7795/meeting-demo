import EventEmitter from 'events'
import { useEffect, useState } from 'react'

export class MapContainer<K, T> extends EventEmitter {
  map: Map<K, T> = new Map()
  list: T[] = []

  constructor() {
    super()
  }

  // TODO: Set Batch
  set(key: K, value: T) {
    this.map.set(key, value)
    this.list = Array.from(this.map.values())
    this.emit('list', this.list)
    this.emit('map', this.map)
    this.emit('slot_' + key, value)
  }

  has(key: K): boolean {
    return this.map.has(key)
  }

  get(key: K): T | undefined {
    return this.map.get(key)
  }

  del(key: K) {
    this.map.delete(key)
    this.list = Array.from(this.map.values())
    this.emit('list', this.list)
    this.emit('map', this.map)
    this.emit('slot_' + key, undefined)
  }

  onSlotChanged = (slot: K, handler: (data: T) => void) => {
    this.on('slot_' + slot, handler)
  }

  offSlotChanged = (slot: K, handler: (data: T) => void) => {
    this.off('slot_' + slot, handler)
  }

  onMapChanged = (handler: (map: Map<K, T>) => void) => {
    this.on('map', handler)
  }

  offMapChanged = (handler: (map: Map<K, T>) => void) => {
    this.on('map', handler)
  }

  onListChanged = (handler: (map: T[]) => void) => {
    this.on('list', handler)
  }

  offListChanged = (handler: (map: T[]) => void) => {
    this.on('list', handler)
  }
}

export function useReactionList<K, T>(containter: MapContainer<K, T>): T[] {
  const [list, setList] = useState<T[]>(containter.list)
  useEffect(() => {
    containter.onListChanged(setList)
    return () => {
      containter.offListChanged(setList)
    }
  }, [containter, setList])
  return list
}
