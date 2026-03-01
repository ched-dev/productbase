import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CommonOptions, RecordFullListOptions, RecordListOptions, RecordOptions } from 'pocketbase'
import { usePbClient } from '@/lib/pb/client'
import { PBData, PBDataList } from '@/lib/pb/data'
import { ApiError, getApiError } from '@/lib/pb/errors'

// ---- Types ----

export interface CollectionDefaults {
  expand?: string
  sort?: string
  filter?: string
  perPage?: number
  fields?: string
  /**
   * Attach the logged in user to `user` when the create request is made
   */
  attachUserOnCreate?: boolean
}

type LastActiveOp = 'list' | 'all' | 'getOne' | 'create' | 'update' | 'delete' | null

export interface UsePocketbaseCollectionReturn {
  list:     (opts?: RecordListOptions) => void
  all:      (opts?: RecordFullListOptions) => void
  getOne:   (id: string, opts?: RecordOptions) => void
  create:   (data: Record<string, unknown> | FormData, opts?: RecordOptions) => Promise<PBData>
  update:   (id: string, data: Record<string, unknown> | FormData, opts?: RecordOptions) => Promise<PBData>
  delete:   (id: string, opts?: CommonOptions) => Promise<void>
  fetching: boolean
  loading:  boolean
  success:  boolean
  error:    ApiError | null
  data:     PBDataList | PBData | undefined
}

// ---- Query Key Factory ----

const collectionKeys = {
  all:     (col: string) => ['collection', col] as const,
  lists:   (col: string) => ['collection', col, 'list'] as const,
  list:    (col: string, opts: object) => ['collection', col, 'list', opts] as const,
  alls:    (col: string) => ['collection', col, 'all'] as const,
  allFull: (col: string, opts: object) => ['collection', col, 'all', opts] as const,
  ones:    (col: string) => ['collection', col, 'one'] as const,
  one:     (col: string, id: string, opts: object) => ['collection', col, 'one', id, opts] as const,
}

// ---- Hook ----

export function usePocketbaseCollection(
  collectionName: string,
  defaults?: CollectionDefaults,
): UsePocketbaseCollectionReturn {
  const pb = usePbClient()
  const queryClient = useQueryClient()

  // Memoize defaults by primitive values to avoid thrashing deps when callers pass inline objects
  const stableDefaults = useMemo<CollectionDefaults>(
    () => defaults ?? {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaults?.expand, defaults?.sort, defaults?.filter, defaults?.perPage, defaults?.fields],
  )

  // ---- State for active query parameters ----
  const [listParams,   setListParams]   = useState<RecordListOptions | null>(null)
  const [allParams,    setAllParams]    = useState<RecordFullListOptions | null>(null)
  const [getOneParams, setGetOneParams] = useState<{ id: string; opts: RecordOptions } | null>(null)
  const [lastActiveOp, setLastActiveOp] = useState<LastActiveOp>(null)

  // ---- Read: list (paginated) ----
  const listQuery = useQuery({
    queryKey: listParams
      ? collectionKeys.list(collectionName, listParams)
      : collectionKeys.lists(collectionName),
    queryFn: async () => {
      const { perPage = stableDefaults.perPage ?? 30, ...rest } = listParams!
      const result = await pb.collection(collectionName).getList(1, perPage, rest)
      return new PBDataList(result)
    },
    enabled: listParams !== null,
    gcTime: 5 * 60 * 1000,
  })

  // ---- Read: all (full list across all pages) ----
  const allQuery = useQuery({
    queryKey: allParams
      ? collectionKeys.allFull(collectionName, allParams)
      : collectionKeys.alls(collectionName),
    queryFn: async () => {
      const result = await pb.collection(collectionName).getFullList(allParams!)
      return new PBDataList({
        page: 1,
        perPage: result.length,
        totalPages: 1,
        totalItems: result.length,
        items: result,
      })
    },
    enabled: allParams !== null,
    gcTime: 5 * 60 * 1000,
  })

  // ---- Read: getOne ----
  const getOneQuery = useQuery({
    queryKey: getOneParams
      ? collectionKeys.one(collectionName, getOneParams.id, getOneParams.opts)
      : collectionKeys.ones(collectionName),
    queryFn: async () => {
      const { id, opts } = getOneParams!
      const result = await pb.collection(collectionName).getOne(id, opts)
      return new PBData(result)
    },
    enabled: getOneParams !== null,
    gcTime: 5 * 60 * 1000,
  })

  // ---- Mutation: create ----
  const createMutation = useMutation({
    mutationFn: async ({ data, opts }: { data: Record<string, unknown> | FormData; opts?: RecordOptions }) => {
      let payload = data
      if (stableDefaults.attachUserOnCreate && pb.authStore.record?.id) {
        if (payload instanceof FormData) {
          const fd = new FormData()
          for (const [k, v] of (data as FormData).entries()) fd.append(k, v)
          fd.append('user', pb.authStore.record.id)
          payload = fd
        } else {
          payload = { user: pb.authStore.record.id, ...(data as Record<string, unknown>) }
        }
      }
      const result = await pb.collection(collectionName).create(payload, { ...stableDefaults, ...opts })
      return new PBData(result)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all(collectionName) })
    },
  })

  // ---- Mutation: update ----
  const updateMutation = useMutation({
    mutationFn: async ({ id, data, opts }: { id: string; data: Record<string, unknown> | FormData; opts?: RecordOptions }) => {
      const result = await pb.collection(collectionName).update(id, data, { ...stableDefaults, ...opts })
      return new PBData(result)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all(collectionName) })
    },
  })

  // ---- Mutation: delete ----
  const deleteMutation = useMutation({
    mutationFn: async ({ id, opts }: { id: string; opts?: CommonOptions }) => {
      await pb.collection(collectionName).delete(id, opts)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all(collectionName) })
    },
  })

  // ---- Public read methods ----
  const list = useCallback(
    (opts: RecordListOptions = {}) => {
      setListParams({ ...stableDefaults, ...opts })
      setLastActiveOp('list')
    },
    [stableDefaults],
  )

  const all = useCallback(
    (opts: RecordFullListOptions = {}) => {
      setAllParams({ ...stableDefaults, ...opts })
      setLastActiveOp('all')
    },
    [stableDefaults],
  )

  const getOne = useCallback(
    (id: string, opts: RecordOptions = {}) => {
      setGetOneParams({ id, opts: { ...stableDefaults, ...opts } })
      setLastActiveOp('getOne')
    },
    [stableDefaults],
  )

  // ---- Public write methods ----
  const create = useCallback(
    (data: Record<string, unknown> | FormData, opts?: RecordOptions) => {
      setLastActiveOp('create')
      return createMutation.mutateAsync({ data, opts })
    },
    [createMutation],
  )

  const update = useCallback(
    (id: string, data: Record<string, unknown> | FormData, opts?: RecordOptions) => {
      setLastActiveOp('update')
      return updateMutation.mutateAsync({ id, data, opts })
    },
    [updateMutation],
  )

  const deleteRecord = useCallback(
    (id: string, opts?: CommonOptions) => {
      setLastActiveOp('delete')
      return deleteMutation.mutateAsync({ id, opts })
    },
    [deleteMutation],
  )

  // ---- Derive active status ----
  const activeQuery =
    lastActiveOp === 'list'   ? listQuery :
    lastActiveOp === 'all'    ? allQuery :
    lastActiveOp === 'getOne' ? getOneQuery :
    null

  const activeMutation =
    lastActiveOp === 'create' ? createMutation :
    lastActiveOp === 'update' ? updateMutation :
    lastActiveOp === 'delete' ? deleteMutation :
    null

  const active = activeQuery ?? activeMutation
  const rawError = active?.error ?? null

  return {
    list,
    all,
    getOne,
    create,
    update,
    delete: deleteRecord,

    fetching: activeQuery?.isFetching ?? activeMutation?.isPending ?? false,
    loading:  active?.isPending ?? false,
    success:  active?.isSuccess ?? false,
    error:    rawError ? getApiError(rawError) : null,
    data:     activeQuery?.data ?? (activeMutation?.data as PBData | undefined),
  }
}
