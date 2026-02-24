import React, { useCallback, useEffect } from 'react'
import { AutoSizer } from 'react-virtualized'
import { areEqual, VariableSizeList as List } from 'react-window'
import { GlobalStateProp } from '@/data/globalState'
import Entry, { EntryModel } from '@/data/models/Entry'
import { useListView } from '../hooks/useListView'
import EntriesSummary from './EntriesSummary'
import EntryView from './Entry'
import Filters from './Filters'
import LoadingIcon from './LoadingIcon'
import ScreenBody from './ScreenBody'

interface RowProps {
  data: {
    filteredEntries: EntryModel[]
    viewingId: string | null
    setViewingIndex: (index: number) => void
    urlProps: string
  }
  index: number
  style: React.CSSProperties
}

const Row = React.memo(({ data, index, style }: RowProps) => {
  const { filteredEntries = [], viewingId, setViewingIndex, urlProps } = data
  const entry = filteredEntries[index]
  const isHighlighted = viewingId === entry.id
  const onUpdateViewingIndex = () => setViewingIndex(index)

  return (
    <EntryView
      key={index}
      entry={entry}
      style={style}
      onUpdate={onUpdateViewingIndex}
      onFocus={onUpdateViewingIndex}
      highlighted={isHighlighted}
      urlProps={urlProps}
    />
  )
}, areEqual)

const Entries: React.FC<GlobalStateProp['state']> = ({
  filteredEntries = [],
  filteredBy = {},
}) => {
  const {
    listRef,
    viewingId,
    urlProps,
    setViewingIndex,
    scrollToTop,
    scrollToBottom,
  } = useListView<EntryModel>({
    items: filteredEntries,
    onParamsUpdate: (params) => Entry.setFilterFromUrl(params),
  })

  const renderFilters = useCallback(() => {
    if (Entry.currentFilter.query) {
      return (
        <Filters
          {...Entry.currentFilter}
          entries={filteredEntries}
        />
      )
    }
    return null
  }, [filteredEntries])

  return (
    <ScreenBody>
      <div className="screen-virtualized-container">
        {!Entry.loaded && (
          <div className="screen-empty-message">
            <LoadingIcon size="xl" ariaLabel="Loading Entries" />
          </div>
        )}
        {Entry.loaded && filteredEntries.length === 0 && (
          <em className="screen-empty-message">No Matching Entries</em>
        )}
        {filteredEntries.length > 0 && (
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <List
                ref={listRef}
                height={height}
                width={width}
                estimatedItemSize={120}
                itemCount={filteredEntries.length}
                itemSize={(index: number) =>
                  110 +
                  Math.floor(
                    (filteredEntries[index].tagsRaw || '').length / 30
                  ) *
                    20
                }
                itemData={{
                  filteredEntries,
                  setViewingIndex,
                  viewingId,
                  urlProps,
                }}
                itemKey={(index: number) => filteredEntries[index].id}
                overscanCount={10}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        )}
      </div>
      {renderFilters?.()}
      <EntriesSummary actions={{ scrollToTop, scrollToBottom }} />
    </ScreenBody>
  )
}

export default Entries
