import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { Book, FakerApiResponse } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private http = inject(HttpClient);

  /**
   * Note :
   * In a real application, we would not fetch all the data at once.
   * Pagination would be handled server-side, fetching data page by page using query parameters
   * (e.g., `?page=1`).
   * Since fakerapi.it does not support this type of pagination here,
   * we are fetching a batch of 80 items all at once as a workaround.
   */
  private apiUrl = 'https://fakerapi.it/api/v2/books?_seed=12456&_quantity=80';

  private booksSubject = new BehaviorSubject<Book[]>([]);
  books$ = this.booksSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  getBooks(quantity: number = 20): Observable<Book[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<FakerApiResponse<Book>>(`${this.apiUrl}?_quantity=${quantity}`).pipe(
      map((response) => response.data),
      tap((books) => {
        this.booksSubject.next(books);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        console.error('Error fetching books:', error);
        this.errorSubject.next('Failed to load books. Please try again later.');
        this.loadingSubject.next(false);
        return of([]);
      }),
    );
  }
}
