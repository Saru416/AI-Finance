import React, { Suspense } from 'react'
import DashBoardPage from './page.jsx'
import BarLoader from 'react-spinners/BarLoader';

const DashBoardLayout = () => {
  return (
    <div className='px-5'>
        <h1 className='text-6xl font-bold gradient-title mb-5'>DashBoard</h1>
        <Suspense falllback={<BarLoader className="mt-4" width={"100%"} color='#9333ea' />}>
            <DashBoardPage/>
        </Suspense>
    </div>
  )
}

export default DashBoardLayout
