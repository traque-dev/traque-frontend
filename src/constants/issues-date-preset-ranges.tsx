import dayjs from 'dayjs';

export type IssuesDatePresetRange = {
  label: string;
  from: Date;
  to: Date;
};

export const issuesDatePresetRanges: IssuesDatePresetRange[] = [
  { label: '24h', from: dayjs().subtract(1, 'day').toDate(), to: new Date() },
  { label: '7d', from: dayjs().subtract(7, 'day').toDate(), to: new Date() },
  {
    label: '14d',
    from: dayjs().subtract(14, 'day').toDate(),
    to: new Date(),
  },
  {
    label: '30d',
    from: dayjs().subtract(30, 'day').toDate(),
    to: new Date(),
  },
];
