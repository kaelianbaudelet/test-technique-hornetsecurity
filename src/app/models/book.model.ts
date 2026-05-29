export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  isbn: string;
  image: string;
  published: string;
  publisher: string;
}

export interface FakerApiResponse<T> {
  status: string;
  code: number;
  total: number;
  data: T[];
}
