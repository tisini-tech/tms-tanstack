import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { UpdateFixtureEventPayload } from '#/data/fixtures'
import type { CreateMatchEventPayload } from '#/lib/payloads'

export type EditedMatchEvent = {
  eventId: number
  body: UpdateFixtureEventPayload
}

export type VideoCollection = {
  fixtureId: number
  firstHalfTimestamp: string
  secondHalfTimestamp: string
  videoEvents: CreateMatchEventPayload[]
  editedEvents?: EditedMatchEvent[]
}

export type Store = {
  videoCollection: VideoCollection | null
}

export type State = {
  store: Store
}

export type Actions = {
  updateVideoCollection: (
    update: (Partial<VideoCollection> & { fixtureId: number }) | null,
  ) => void
}

const initialState: Store = {
  videoCollection: null,
}

export const useStore = create<State & Actions>()(
  persist(
    (set) => ({
      store: initialState,
      updateVideoCollection: (update) =>
        set((state) => {
          if (update == null) {
            return { store: { videoCollection: null } }
          }

          const current = state.store.videoCollection
          const base: VideoCollection =
            current?.fixtureId === update.fixtureId
              ? current
              : {
                  fixtureId: update.fixtureId,
                  firstHalfTimestamp: '',
                  secondHalfTimestamp: '',
                  videoEvents: [],
                  editedEvents: [],
                }

          return {
            store: {
              videoCollection: { ...base, ...update },
            },
          }
        }),
    }),
    {
      name: 'store',
    },
  ),
)
