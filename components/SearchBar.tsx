import { FC, ChangeEvent } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: FC<SearchBarProps> = ({ onSearch }) => {
  return (
    <div className='mt-4'>
      <input
        type='text'
        placeholder='Search products...'
        className='w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
        onChange={(e: ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
