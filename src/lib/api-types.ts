// External API Types

// OMDb API Response Types
export type OmdbSearchResult = {
  Search?: OmdbMovie[]
  totalResults: string
  Response: 'True' | 'False'
  Error?: string
}

export type OmdbMovie = {
  Title: string
  Year: string
  imdbID: string
  Type: 'movie' | 'series' | 'episode'
  Poster: string
}

export type OmdbMovieDetail = {
  Title: string
  Year: string
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Poster: string
  Ratings: { Source: string; Value: string }[]
  Metascore: string
  imdbRating: string
  imdbVotes: string
  imdbID: string
  Type: string
  DVD: string
  BoxOffice: string
  Production: string
  Website: string
  Response: 'True' | 'False'
  Error?: string
}

// Open Library API Response Types
export type OpenLibrarySearchResult = {
  numFound: number
  start: number
  numFoundExact: boolean
  docs: OpenLibraryBook[]
}

export type OpenLibraryBook = {
  key: string
  title: string
  author_name?: string[]
  author_key?: string[]
  first_publish_year?: number
  cover_i?: number
  cover_edition_key?: string
  edition_count?: number
  edition_key?: string[]
  publish_date?: string[]
  publisher?: string[]
  language?: string[]
  isbn?: string[]
  subject?: string[]
}

export type OpenLibraryCoverUrl = {
  size: 'S' | 'M' | 'L'
  url: string
}

// Unified Search Result for our UI
export type SearchResultItem = {
  id: string           // external ID (imdbID or OLID)
  title: string
  year: string | number
  posterUrl: string | null
  type: 'movie' | 'book'
  source: 'omdb' | 'openlibrary'
  raw: OmdbMovie | OpenLibraryBook  // keep original for detail view if needed
}

export type MediaDetail = {
  id: string
  title: string
  year?: string
  posterUrl?: string | null
  type: 'movie' | 'book'
  description?: string
  directorOrAuthor?: string
  genresOrSubjects?: string[]
  extraInfo?: { label: string; value: string }[]
}