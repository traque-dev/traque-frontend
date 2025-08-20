export type PageMeta = {
  currentPage: number;
  itemCount: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
};

export type Page<T> = {
  items: T[];
  meta: PageMeta;
};
