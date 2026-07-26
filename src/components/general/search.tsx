import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Loader2, SearchIcon } from 'lucide-react'

interface SearchProps {
  search: string
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSearchClick: () => void
  isLoading: boolean
}
const SearchBar = ({
  search,
  handleSearch,
  handleSearchClick,
  isLoading,
}: SearchProps) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Search teams"
        value={search}
        onChange={handleSearch}
      />
      <Button type="button" variant="outline" onClick={handleSearchClick}>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <SearchIcon className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
}

export default SearchBar
