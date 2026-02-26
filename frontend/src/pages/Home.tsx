import { getUsersFeedback } from "@/lib/query/feedback"
import { useEffect } from "react"

interface Props {
  
}

export default function Home({ }: Props) {
  useEffect(() => {
    getUsersFeedback()
      .then(x => {

      })
      .catch(err => {
        console.error(err)
      })
  })
  
  return (
    <section>
      <h1>Home</h1>
    </section>
  )
}
