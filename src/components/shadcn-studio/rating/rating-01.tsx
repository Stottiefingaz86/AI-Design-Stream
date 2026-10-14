import { useState } from 'react'

import { Rating } from '@/components/ui/rating'

const RatingDemo = () => {
  const [starCount, setStarCount] = useState(3)

  return (
    <div className='flex w-full max-w-xs items-center justify-center'>
      <Rating size={24} precision={1} value={starCount} onValueChange={setStarCount} />
    </div>
  )
}

export default RatingDemo
