import { deprecate, Event } from '../../src/event'
import etro from '../../src/index'
import { mockBaseLayer } from './mocks/layer'

describe('Unit Tests ->', function () {
  describe('Events', function () {
    it('should trigger repeat subscribers', function () {
      const o = mockBaseLayer()

      const types = ['foo.bar.test', 'foo.bar', 'foo']
      types.forEach(type => {
        const history = []
        etro.event.subscribe(o, type, event => {
          expect(event.target).toEqual(o)
          history.push(event)
        })

        etro.event.publish(o, 'foo.bar.test', {})

        expect(history).toEqual([
          {
            target: o,
            type: 'foo.bar.test'
          }
        ])
      })
    })

    it('should trigger one-time subscribers', function () {
      const o = mockBaseLayer()

      const types = ['foo.bar.test', 'foo.bar', 'foo']
      types.forEach(type => {
        const history = []
        etro.event.subscribe(o, type, event => {
          expect(event.target).toEqual(o)
          history.push(event)
        }, { once: true })

        etro.event.publish(o, 'foo.bar.test', {})
        etro.event.publish(o, 'foo.bar.test', {})

        expect(history).toEqual([
          {
            target: o,
            type: 'foo.bar.test'
          }
        ])
      })
    })

    it('unsubscribe removes event listeners', function () {
      const o = mockBaseLayer()
      let listenerCalled = false
      const listener = () => {
        listenerCalled = true
      }

      etro.event.subscribe(o, 'test', listener)
      etro.event.unsubscribe(o, listener)
      etro.event.publish(o, 'test', {})

      expect(listenerCalled).toBe(false)
    })

    it('should publish replaced deprecated events with new events', function () {
      spyOn(console, 'warn')

      // Deprecate the event 'foo.old' in favor of 'foo.new'.
      deprecate('foo.old', 'foo.new')

      const o = mockBaseLayer()
      const history: Event[] = []

      // Listen for both events.
      etro.event.subscribe(o, 'foo', event => {
        history.push(event)
      })

      etro.event.publish(o, 'foo.new', {})

      expect(history).toEqual([
        {
          target: o,
          type: 'foo.old'
        },
        {
          target: o,
          type: 'foo.new'
        }
      ])
    })
  })
})
