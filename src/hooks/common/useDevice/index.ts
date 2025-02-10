'use client'

import { useWindowSize } from 'usehooks-ts'

export const useDevice = () => {
  const { width } = useWindowSize()

  const isMobile = width !== 0 && width < 768
  const isTablet = width !== 0 && width >= 768 && width <= 1280
  const isDesktop = width !== 0 && width > 1024

  return { isMobile, isTablet, isDesktop }
}
