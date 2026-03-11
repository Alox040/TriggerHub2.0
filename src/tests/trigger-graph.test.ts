import { describe, expect, it } from 'vitest'
import { TriggerGraph, TriggerGraphError, type GraphTrigger } from '../core/trigger-engine'

const createTrigger = (overrides: Partial<GraphTrigger> = {}): GraphTrigger => ({
  id: 'trigger_001',
  name: 'OBS Stream Start Trigger',
  enabled: true,
  event: 'obs.stream.started',
  conditions: [{ field: 'streamStatus', operator: 'equals', value: 'started' }],
  actions: [{ type: 'obs.notify', payload: { message: 'Stream started' } }],
  ...overrides,
})

describe('TriggerGraph', () => {
  describe('registerTrigger', () => {
    it('stores trigger by event', () => {
      const graph = new TriggerGraph()
      const trigger = createTrigger()

      graph.registerTrigger(trigger)

      const eventTriggers = graph.getTriggersByEvent(trigger.event)
      expect(eventTriggers).toHaveLength(1)
      expect(eventTriggers[0]?.id).toBe(trigger.id)
    })

    it('stamps createdAt', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger())

      const [record] = graph.getTriggersByEvent('obs.stream.started')
      expect(record?.createdAt).toBeTypeOf('number')
    })

    it('supports multiple triggers for same event', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger({ id: 'trigger_001' }))
      graph.registerTrigger(createTrigger({ id: 'trigger_002' }))

      const eventTriggers = graph.getTriggersByEvent('obs.stream.started')
      expect(eventTriggers).toHaveLength(2)
      expect(eventTriggers.map((trigger) => trigger.id)).toEqual(['trigger_001', 'trigger_002'])
    })

    it('preserves cross-event isolation', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger({ id: 'trigger_obs', event: 'obs.stream.started' }))
      graph.registerTrigger(createTrigger({ id: 'trigger_spotify', event: 'spotify.track.changed' }))

      expect(graph.getTriggersByEvent('obs.stream.started').map((trigger) => trigger.id)).toEqual([
        'trigger_obs',
      ])
      expect(
        graph.getTriggersByEvent('spotify.track.changed').map((trigger) => trigger.id),
      ).toEqual(['trigger_spotify'])
    })

    it('throws TriggerGraphError for empty id', () => {
      const graph = new TriggerGraph()
      expect(() => graph.registerTrigger(createTrigger({ id: '  ' }))).toThrow(TriggerGraphError)
      expect(() => graph.registerTrigger(createTrigger({ id: '  ' }))).toThrow('must not be empty')
    })

    it('throws TriggerGraphError for empty name', () => {
      const graph = new TriggerGraph()
      expect(() => graph.registerTrigger(createTrigger({ name: ' ' }))).toThrow(TriggerGraphError)
      expect(() => graph.registerTrigger(createTrigger({ name: ' ' }))).toThrow('must not be empty')
    })

    it('throws TriggerGraphError for empty event', () => {
      const graph = new TriggerGraph()
      expect(() => graph.registerTrigger(createTrigger({ event: '' }))).toThrow(TriggerGraphError)
      expect(() => graph.registerTrigger(createTrigger({ event: '' }))).toThrow('must not be empty')
    })

    it('throws TriggerGraphError for duplicate id', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger({ id: 'trigger_001' }))

      expect(() => graph.registerTrigger(createTrigger({ id: 'trigger_001' }))).toThrow(
        TriggerGraphError,
      )
      expect(() => graph.registerTrigger(createTrigger({ id: 'trigger_001' }))).toThrow(
        'already registered',
      )
    })
  })

  describe('removeTrigger', () => {
    it('removes trigger from indices', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger({ id: 'trigger_001' }))

      graph.removeTrigger('trigger_001')

      expect(graph.hasTrigger('trigger_001')).toBe(false)
      expect(graph.getTriggersByEvent('obs.stream.started')).toEqual([])
      expect(graph.size()).toBe(0)
    })

    it('is idempotent for unknown ids', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger({ id: 'trigger_001' }))

      expect(() => graph.removeTrigger('unknown')).not.toThrow()
      expect(() => graph.removeTrigger('unknown')).not.toThrow()
      expect(graph.size()).toBe(1)
    })

    it('cleans up empty event bucket', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger({ id: 'trigger_001', event: 'obs.stream.started' }))

      graph.removeTrigger('trigger_001')

      expect(graph.getTriggersByEvent('obs.stream.started')).toEqual([])
      expect(graph.getAll()).toEqual([])
    })

    it('does not remove sibling triggers under same event', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger({ id: 'trigger_001', event: 'obs.stream.started' }))
      graph.registerTrigger(createTrigger({ id: 'trigger_002', event: 'obs.stream.started' }))

      graph.removeTrigger('trigger_001')

      expect(graph.getTriggersByEvent('obs.stream.started').map((trigger) => trigger.id)).toEqual([
        'trigger_002',
      ])
      expect(graph.size()).toBe(1)
    })

    it('does not affect triggers from other events', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger({ id: 'trigger_obs', event: 'obs.stream.started' }))
      graph.registerTrigger(createTrigger({ id: 'trigger_spotify', event: 'spotify.track.changed' }))

      graph.removeTrigger('trigger_obs')

      expect(graph.getTriggersByEvent('obs.stream.started')).toEqual([])
      expect(
        graph.getTriggersByEvent('spotify.track.changed').map((trigger) => trigger.id),
      ).toEqual(['trigger_spotify'])
    })
  })

  describe('getTriggersByEvent', () => {
    it('returns [] for unknown event', () => {
      const graph = new TriggerGraph()
      expect(graph.getTriggersByEvent('unknown.event')).toEqual([])
    })

    it('returns triggers for matching event only', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger({ id: 'trigger_obs', event: 'obs.stream.started' }))
      graph.registerTrigger(createTrigger({ id: 'trigger_spotify', event: 'spotify.track.changed' }))

      expect(graph.getTriggersByEvent('obs.stream.started').map((trigger) => trigger.id)).toEqual([
        'trigger_obs',
      ])
    })

    it('returns a snapshot array such that mutating the returned array does not corrupt internal index structure', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger({ id: 'trigger_001', event: 'obs.stream.started' }))
      graph.registerTrigger(createTrigger({ id: 'trigger_002', event: 'obs.stream.started' }))

      const snapshot = graph.getTriggersByEvent('obs.stream.started')
      snapshot.pop()

      expect(snapshot).toHaveLength(1)
      expect(graph.getTriggersByEvent('obs.stream.started')).toHaveLength(2)
    })
  })

  describe('utility methods', () => {
    it('hasTrigger works before and after removal', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger({ id: 'trigger_001' }))

      expect(graph.hasTrigger('trigger_001')).toBe(true)

      graph.removeTrigger('trigger_001')

      expect(graph.hasTrigger('trigger_001')).toBe(false)
    })

    it('size reflects registrations/removals correctly', () => {
      const graph = new TriggerGraph()
      expect(graph.size()).toBe(0)

      graph.registerTrigger(createTrigger({ id: 'trigger_001' }))
      graph.registerTrigger(createTrigger({ id: 'trigger_002', event: 'spotify.track.changed' }))
      expect(graph.size()).toBe(2)

      graph.removeTrigger('trigger_001')
      expect(graph.size()).toBe(1)
    })

    it('getAll returns all triggers across events', () => {
      const graph = new TriggerGraph()
      graph.registerTrigger(createTrigger({ id: 'trigger_obs', event: 'obs.stream.started' }))
      graph.registerTrigger(createTrigger({ id: 'trigger_spotify', event: 'spotify.track.changed' }))

      const all = graph.getAll()
      expect(all).toHaveLength(2)
      expect(all.map((trigger) => trigger.id)).toEqual(['trigger_obs', 'trigger_spotify'])
    })
  })
})
