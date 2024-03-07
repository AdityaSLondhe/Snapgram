import { useGetCurrentUser } from '@/lib/react-query/queriesAndMutations'
import React from 'react'

const About = () => {
    const {data:user} = useGetCurrentUser();
    console.log(user)
  return (
    <div className='profile-inner_container'>
        <img src={user?.imageUrl} alt='Profile-img' width={150} className=' rounded-full'/>
        <div className='flex flex-col w-full m-2 flex-center xl:items-start'>
            <div className='flex flex-col flex-center xl:items-start gap-2'>
                <h1 className=' text-3xl font-medium'>{user?.name}</h1>
                <p className=' text-light-3'>{`@${user?.username}`}</p>
            </div>
        </div>
    </div>
  )
}

export default About