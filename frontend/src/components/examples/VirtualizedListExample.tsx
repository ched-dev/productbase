import { useListView } from "@/hooks/useListView"
import { useUserFeedbackCollection } from "@/queryHooks"
import { UserFeedbackRecord } from "@/types"
import { Box } from "@mantine/core"
import { useEffect } from "react"
import { Virtuoso } from "react-virtuoso"

export function VirtualizedListExample() {
  const feedback = useUserFeedbackCollection()
  const feedbackItems = feedback.data?.items as UserFeedbackRecord[]
  const { listItems, listRef, viewingId } = useListView<UserFeedbackRecord>({
    items: feedbackItems || [],
    onParamsUpdate: () => {}
  })

  useEffect(() => {
    feedback.list()
  }, [])

  if (!listItems) {
    return null
  }

  // Virtuoso will use full height of it's parent
  // height must be set on the wrapping element
  return (
    <Box h={200}>
      <Virtuoso
        ref={listRef}
        totalCount={listItems.length}
        itemContent={(index) => (
          <pre style={{ textWrap: 'wrap' }}>
            {JSON.stringify(listItems[index], null, 2)}
          </pre>
        )}
      />
    </Box>
  )
}