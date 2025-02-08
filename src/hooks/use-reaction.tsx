import EventEmitter from 'events'
import { useEffect, useState } from 'react'

export class DataContainer<T> extends EventEmitter {
  data: T
  version: number = 0
  constructor(init: T | (() => T)) {
    super()
    if (typeof init === 'function') {
      this.data = (init as any)()
    } else {
      this.data = init
    }
  }

  get value(): T {
    return this.data
  }

  change = (new_value: T) => {
    this.data = new_value
    this.emit('changed', new_value)
    console.log('DataContainer changed to:', new_value)
  }

  addChangeListener = (callback: (data: T) => void) => {
    this.on('changed', callback)
    console.log('DataContainer change listener added')
  }

  removeChangeListener = (callback: (data: T) => void) => {
    this.off('changed', callback)
    console.log('DataContainer change listener removed')
  }
}
export class MapContainer<K, T> extends EventEmitter {
  map: Map<K, T> = new Map()
  list: T[] = []

  constructor() {
    super()
  }

  // TODO: Set Batch
  set(key: K, value: T, reactive: boolean = true) {
    this.map.set(key, value)
    this.list = Array.from(this.map.values())
    if (reactive) {
      this.emit('list', this.list)
      this.emit('map', this.map)
      this.emit('slot_' + key, value)
      console.log('MapContainer set:', key, value)
    }
  }

  setBatch(map: Map<K, T>) {
    for (const key of Array.from(map.keys())) {
      this.map.set(key, map.get(key)!)
    }
    this.list = Array.from(this.map.values())
    this.emit('list', this.list)
    this.emit('map', this.map)
  }

  has(key: K): boolean {
    return this.map.has(key)
  }

  get(key: K): T | undefined {
    return this.map.get(key)
  }

  del(key: K, reactive: boolean = true) {
    this.map.delete(key)
    this.list = Array.from(this.map.values())
    if (reactive) {
      this.emit('list', this.list)
      this.emit('map', this.map)
      this.emit('slot_' + key, undefined)
    }
  }

  delBatch(keys: K[]) {
    for (const key of keys) {
      this.map.delete(key)
    }
    this.list = Array.from(this.map.values())
    this.emit('list', this.list)
    this.emit('map', this.map)
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

export function useReactionData<T>(container: DataContainer<T>): T {
  const [data, setData] = useState(container.data)
  useEffect(() => {
    container.addChangeListener(setData)
    return () => {
      container.removeChangeListener(setData)
    }
  }, [container, setData])
  return data
}
