import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button"
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { BookMarked, Clapperboard} from "lucide-react"

const Saved = () => {

  const {data:user ,isPending:isLoading}=useGetCurrentUser()

  // console.log(user?.save)
  const savePosts = user?.save
    .map((savePost: Models.Document) => ({
      ...savePost.post,
      creator: {
        imageUrl: user.imageUrl,
      },
    }))
    .reverse();
  return (
    <div className="saved-container">
      <div className="flex flex-start w-full space-x-3 max-w-5xl">
        <img src={'/assets/icons/save.svg'} alt="save" width={30} height={30} className=" invert-white"/>
        <h2 className='h3-bold md:h2-bold w-full'>Saved Posts</h2>
      </div>
      <div className='hidden md:flex-between w-full max-w-5xl min-w-fit '>
        <div className=" bg-dark-3 rounded-lg saved-categories flex">
          <Button className="border rounded-r-none">
            <img src="/assets/icons/posts.svg" alt="gallery" width={20} />
            <p>Posts</p>
          </Button>
          <Button className="rounded-none">
            <Clapperboard size={20} className="invert-primary"/>
            <p>Reels</p>
          </Button>
          <Button className="rounded-l-none">
            <BookMarked width={20} className="invert-primary"/>
            <p>Collections</p>
          </Button>
        </div>
        <div className='flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer'>
          <p className='small-medium md:base-medium text-light-2'>All</p>
          <img src="/assets/icons/filter.svg" alt="filter" width={20} height={20}/>
        </div>
      </div>
      {isLoading ? (<Loader />) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savePosts.length === 0 ? (
            <p className="text-light-4">No available posts</p>
          ) : (
            <GridPostList posts={savePosts} showStats={false} />
          )}
        </ul>
      )}
    </div>
  )
}

export default Saved