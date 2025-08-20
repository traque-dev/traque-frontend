export type Pageable<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  size: number;
  page: number;
  sort?: `${Extract<keyof T, string>}:${'ASC' | 'DESC'}`[];
};
