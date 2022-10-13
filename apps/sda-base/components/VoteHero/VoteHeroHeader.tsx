import { ReactNode } from 'react'

export interface VoteHeroHeaderProps {
  title?: string
  description?: string
  image: ReactNode
}

export const VoteHeroHeader = ({
  title,
  description,
  image,
}: VoteHeroHeaderProps) => (
  <div className="flex flex-col items-center justify-center border-b border-inactive py-16 px-4">
    <div className="mb-8 h-24 w-24 overflow-hidden rounded-full">{image}</div>
    <h1 className="hero-text mb-1 h-9 text-[26px]">{title}</h1>
    <p className="primary-text h-5">{description}</p>
  </div>
)
