import { type } from 'arktype';

export const exceptionDailyStatisticSchema = type({
  date: 'string.date',
  count: 'number',
}).array();
