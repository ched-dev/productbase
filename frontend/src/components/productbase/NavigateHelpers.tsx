import { setPreviousPath } from "@/hooks/useNavigateHelpers"
import { setNavigate } from "@/hooks/useNavigateHelpers"
import { useRef, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export default function NavigateHelpers() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname + location.search
  const prevRef = useRef(currentPath)

  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  // cache the previous path for goBackOrNavigate helper functionality
  useEffect(() => {
    if (prevRef.current !== currentPath) {
      setPreviousPath(prevRef.current)
      prevRef.current = currentPath
    }
  }, [currentPath])

  return null
}