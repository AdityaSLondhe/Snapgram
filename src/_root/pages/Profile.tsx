import About from "@/components/shared/About"
import GridPostList from "@/components/shared/GridPostList";
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";

const Profile = () => {
  const {data:user} = useGetCurrentUser();
  return (
    <div className="profile-container">
      <About/>
      <GridPostList posts={user?.posts} showStats={true} showUser={false}/>
    </div>
  )
}

export default Profile