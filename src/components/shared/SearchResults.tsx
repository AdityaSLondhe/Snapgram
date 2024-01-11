import Loader from './Loader';
import GridPostList from './GridPostList';

type SearchResultsProps = {
  isSearchFetching: boolean;
  searchedPosts: any;
}

const SearchResults = ({isSearchFetching, searchedPosts}: SearchResultsProps) => {
  if(isSearchFetching) return <Loader/>

  else if(searchedPosts && searchedPosts.documents.length > 0){
    return(
      <GridPostList posts={searchedPosts.documents} />
    )
  }else{
    return (
        <p className=' text-light-4 text-center w-full mt-10'>No results found</p>
    )
  }
}

export default SearchResults