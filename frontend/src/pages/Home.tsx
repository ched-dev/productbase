import LoadingIcon from "@/components/LoadingIcon"
import ScreenBody from "@/components/ScreenBody"
import { useUserFeedbackCollection } from "@/queryHooks"
import { useEffect } from "react"

interface Props {
  
}

export default function Home({ }: Props) {
  const userFeedbackCollection = useUserFeedbackCollection()

  useEffect(() => {
    userFeedbackCollection.all({
      expand: 'user,feedback_actions'
    })
  }, [])
  
  return (
    <ScreenBody>
      <h1>Home</h1>
      {userFeedbackCollection.loading || !userFeedbackCollection.data ? (
        <LoadingIcon />
      ) : (
        <pre style={{ fontSize: 12 }}>{JSON.stringify(userFeedbackCollection.data.items, null, 2)}</pre>
      )}
    </ScreenBody>
  )
}
