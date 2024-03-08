import { useGetCurrentUser } from '@/lib/react-query/queriesAndMutations'
import { Button } from '../ui/button';
import Loader from './Loader';

const About = () => {
    const {data:user,isPending:isLoading} = useGetCurrentUser();
    
  return (
    <div className='profile-inner_container'>
      {isLoading? <Loader/>:<>
        <img src={user?.imageUrl} alt='Profile-img' width={150} className=' rounded-full'/>
        <div className='flex flex-col w-full m-2 flex-center xl:items-start'>
            <div className='flex flex-col flex-center xl:items-start pb-4 w-full'>
                <div className='flex w-full space-x-12'>
                  <h1 className=' text-3xl font-medium'>{user?.name}</h1>
                  <Button className='bg-dark-4 ml-auto space-x-2 cursor-pointer hover:scale-105 transition'>
                    <img src="/assets/icons/edit.svg" alt="Edit" width={20}/>
                    <p>Edit Profile</p>
                  </Button>
                </div>
                <p className=' text-light-3'>{`@${user?.username}`}</p>
            </div>
            <div className='profile-stats'>
              <div>
                <p>{user?.posts.length}</p> <h3>Posts</h3>
              </div>
              <div>
                <p>0</p> <h3>Followers</h3>
              </div>
              <div>
                <p>0</p> <h3>Following</h3>
              </div>
            </div>
            <h4 className='profile-bio'>{user?.bio} </h4>
        </div>
        </>}
    </div>
  )
}

export default About