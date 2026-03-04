import { VirtualizedListExample } from "@/components/examples/VirtualizedListExample"
import ContentContainer from "@/components/layout/ContentContainer"
import ScreenBody from "@/components/layout/ScreenBody"

export default function AppHome() {
  return (
    <ScreenBody>
      <ContentContainer>
        <h1>Home</h1>
        <VirtualizedListExample />
      </ContentContainer>
    </ScreenBody>
  )
}
