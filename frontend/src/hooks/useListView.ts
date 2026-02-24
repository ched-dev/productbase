import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { VariableSizeList as List } from 'react-window'
import { ParamsFilter, QueryFilter } from '@/lib/UrlParams'
import { useQueryParam } from './useQueryParam'

interface UseListViewProps<T> {
  items: (T & { id: string })[]
  onParamsUpdate: (params: ParamsFilter | null) => void
}

interface UseListViewReturn {
  listRef: React.Ref<List>
  viewingId: string | null
  urlProps: string
  setViewingIndex: (index: number | null) => void
  scrollToIndex: (index?: number) => void
  scrollToTop: () => void
  scrollToBottom: (setIndex?: boolean) => void
  getViewingIndex: (id: UseListViewReturn['viewingId']) => number
}

export const useListView = <T>({
  items = [],
  onParamsUpdate,
}: UseListViewProps<T>): UseListViewReturn => {
  const listRef = useRef<List>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query] = useQueryParam<QueryFilter>('query')

  const updateParams = useCallback(() => {
    onParamsUpdate(query ? { query } : null)
  }, [query, onParamsUpdate])

  const getViewingId = useCallback(() => {
    const viewingId = searchParams.get('viewingId')
    return viewingId && viewingId !== 'undefined' ? viewingId : null
  }, [searchParams])

  const setViewingIndex = useCallback(
    (index: number | null = null) => {
      const entry = index !== null ? items[index] : undefined
      const newSearchParams = new URLSearchParams(searchParams)
      if (entry) {
        newSearchParams.set('viewingId', entry.id)
      } else {
        newSearchParams.delete('viewingId')
      }
      navigate(
        {
          pathname: location.pathname,
          search: newSearchParams.toString(),
        },
        {
          replace: true,
        }
      )
    },
    [items, location.pathname, navigate, searchParams]
  )

  const scrollToIndex = useCallback((index = 0) => {
    listRef.current?.scrollToItem(Number(index), 'start')
  }, [])

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToItem(0, 'start')
    setViewingIndex(0)
  }, [setViewingIndex])

  const scrollToBottom = useCallback(
    (setIndex = true) => {
      listRef.current?.scrollToItem(items.length - 1, 'end')
      setIndex && setViewingIndex(items.length - 1)
    },
    [items.length, setViewingIndex]
  )

  const getViewingIndex = useCallback(
    (id: UseListViewReturn['viewingId']) =>
      items.findIndex((entry) => entry.id === id),
    [items]
  )

  const getUrlProps = useCallback(() => {
    const viewingId = getViewingId()
    return viewingId ? `?viewingId=${viewingId}` : ''
  }, [getViewingId])

  useEffect(() => {
    // set initial params
    updateParams()

    const viewingId = getViewingId()
    const viewingIndex = getViewingIndex(viewingId)

    if (viewingId && viewingIndex !== -1) {
      scrollToIndex(viewingIndex)
    } else {
      scrollToBottom()
    }
  }, [])

  useEffect(() => {
    updateParams()
  }, [location.search])

  return {
    listRef,
    viewingId: getViewingId(),
    urlProps: getUrlProps(),
    setViewingIndex,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    getViewingIndex,
  }
}
