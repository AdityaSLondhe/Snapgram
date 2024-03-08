import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const Home = () => {
  const { data: posts, isPending: isPostLoading,isError: isErrorPosts} = useGetRecentPosts();

  const {data: users,fetchNextPage,hasNextPage}  = useGetUsers();
  const {ref,inView}  = useInView();
  useEffect(() => {
    if(inView){
      fetchNextPage();
    }
  }, [inView])
  

  if (isErrorPosts) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bole text-left w-full">Home Feed</h2>
          {isPostLoading && !posts ? (
            <div ref={ref}><Loader/></div>
            ):(
              <ul className="flex flex-col flex-1 gap-9 w-full">
                {posts?.documents.map((post: Models.Document)=>(
                  <PostCard post={post} key={post.caption}/>
                ))}
              </ul>
            )}
        </div>
        {users && hasNextPage && (
          <div ref={ref} className='mt-10'>
            <Loader/>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home