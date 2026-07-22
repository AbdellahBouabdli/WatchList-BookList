import { OmdbSearchResult, OmdbMovie, OpenLibrarySearchResult, OpenLibraryBook, SearchResultItem, OmdbMovieDetail, MediaDetail } from './api-types'

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY
const OMDB_BASE_URL = 'https://www.omdbapi.com/'
const OPENLIBRARY_BASE_URL = 'https://openlibrary.org'

// Build cover URL from Open Library cover ID
function getOpenLibraryCoverUrl(coverId: number | undefined, size: 'S' | 'M' | 'L' = 'M'): string | null {
  if (!coverId) return null
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
}

// Transform OMDb movie to unified SearchResultItem
function transformOmdbMovie(movie: OmdbMovie): SearchResultItem {
  return {
    id: movie.imdbID,
    title: movie.Title,
    year: movie.Year,
    posterUrl: movie.Poster !== 'N/A' ? movie.Poster : null,
    type: 'movie',
    source: 'omdb',
    raw: movie,
  }
}

// Transform Open Library book to unified SearchResultItem
function transformOpenLibraryBook(book: OpenLibraryBook): SearchResultItem {
  return {
    id: book.key.replace('/works/', ''), // Use work ID as external ID
    title: book.title,
    year: book.first_publish_year ?? 'Unknown',
    posterUrl: getOpenLibraryCoverUrl(book.cover_i),
    type: 'book',
    source: 'openlibrary',
    raw: book,
  }
}

/**
 * Search movies via OMDb API
 * @param query - Search query
 * @param page - Page number (default: 1)
 */
export async function searchMovies(query: string, page = 1): Promise<SearchResultItem[]> {
  if (!OMDB_API_KEY) {
    throw new Error('OMDb API key not configured. Add VITE_OMDB_API_KEY to .env.local')
  }

  const params = new URLSearchParams({
    apikey: OMDB_API_KEY,
    s: query,
    type: 'movie',
    page: page.toString(),
  })

  const response = await fetch(`${OMDB_BASE_URL}?${params}`)
  const data: OmdbSearchResult = await response.json()

  if (data.Response === 'False') {
    if (data.Error === 'Movie not found!') return []
    throw new Error(data.Error || 'OMDb search failed')
  }

  return data.Search?.map(transformOmdbMovie) ?? []
}

/**
 * Search books via Open Library API
 * @param query - Search query
 * @param page - Page number (default: 1)
 */
export async function searchBooks(query: string, page = 1): Promise<SearchResultItem[]> {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    limit: '20',
    fields: 'key,title,author_name,first_publish_year,cover_i,cover_edition_key',
  })

  const response = await fetch(`${OPENLIBRARY_BASE_URL}/search.json?${params}`)
  const data: OpenLibrarySearchResult = await response.json()

  return data.docs.map(transformOpenLibraryBook)
}

/**
 * Search both movies and books in parallel
 */
export async function searchAll(query: string, page = 1): Promise<{
  movies: SearchResultItem[]
  books: SearchResultItem[]
}> {
  const [movies, books] = await Promise.all([
    searchMovies(query, page),
    searchBooks(query, page),
  ])

  return { movies, books }
}

/**
 * Get movie details by IMDb ID
 */
export async function getMovieDetails(imdbId: string): Promise<OmdbMovieDetail | null> {
  if (!OMDB_API_KEY) {
    throw new Error('OMDb API key not configured')
  }

  const params = new URLSearchParams({
    apikey: OMDB_API_KEY,
    i: imdbId,
    plot: 'full',
  })

  const response = await fetch(`${OMDB_BASE_URL}?${params}`)
  const data: OmdbMovieDetail = await response.json()

  if (data.Response === 'False') return null
  return data
}

/**
 * Get book details by Open Library work ID
 */
export async function getBookDetails(workId: string): Promise<any | null> {
  const cleanId = workId.replace('/works/', '')
  const response = await fetch(`${OPENLIBRARY_BASE_URL}/works/${cleanId}.json`)
  if (!response.ok) return null
  return response.json()
}

/**
 * Get unified media details for movie or book
 */
export async function getUnifiedMediaDetails(
  id: string,
  type: 'movie' | 'book',
  fallbackTitle?: string,
  fallbackPosterUrl?: string | null
): Promise<MediaDetail> {
  if (type === 'movie') {
    try {
      const movieData = await getMovieDetails(id)
      if (movieData) {
        return {
          id,
          title: movieData.Title || fallbackTitle || 'Unknown Movie',
          year: movieData.Year,
          posterUrl: (movieData.Poster && movieData.Poster !== 'N/A') ? movieData.Poster : fallbackPosterUrl,
          type: 'movie',
          description: movieData.Plot !== 'N/A' ? movieData.Plot : undefined,
          directorOrAuthor: movieData.Director !== 'N/A' ? movieData.Director : undefined,
          genresOrSubjects: movieData.Genre !== 'N/A' ? movieData.Genre.split(', ') : [],
          extraInfo: [
            { label: 'IMDb Rating', value: movieData.imdbRating !== 'N/A' ? `★ ${movieData.imdbRating} / 10` : 'N/A' },
            { label: 'Rated', value: movieData.Rated },
            { label: 'Runtime', value: movieData.Runtime },
            { label: 'Cast', value: movieData.Actors },
          ].filter(item => item.value && item.value !== 'N/A'),
        }
      }
    } catch (e) {
      console.warn('Failed to fetch OMDb details:', e)
    }
  } else {
    try {
      const bookData = await getBookDetails(id)
      if (bookData) {
        let desc = ''
        if (typeof bookData.description === 'string') {
          desc = bookData.description
        } else if (bookData.description && typeof bookData.description.value === 'string') {
          desc = bookData.description.value
        }

        const subjects = Array.isArray(bookData.subjects)
          ? bookData.subjects.slice(0, 5)
          : []

        let coverUrl = fallbackPosterUrl
        if (bookData.covers && bookData.covers.length > 0) {
          coverUrl = getOpenLibraryCoverUrl(bookData.covers[0], 'L')
        }

        return {
          id,
          title: bookData.title || fallbackTitle || 'Unknown Book',
          year: bookData.created?.value ? new Date(bookData.created.value).getFullYear().toString() : undefined,
          posterUrl: coverUrl,
          type: 'book',
          description: desc || undefined,
          directorOrAuthor: undefined,
          genresOrSubjects: subjects,
          extraInfo: [],
        }
      }
    } catch (e) {
      console.warn('Failed to fetch Open Library details:', e)
    }
  }

  // Generic fallback if API call fails or detailed info isn't available
  return {
    id,
    title: fallbackTitle || (type === 'movie' ? 'Movie Item' : 'Book Item'),
    posterUrl: fallbackPosterUrl,
    type,
    description: 'No detailed synopsis available for this media archive item.',
  }
}