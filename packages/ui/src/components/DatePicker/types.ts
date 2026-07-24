export type DateRange = {
  from: Date;
  to: Date;
};

export type DateRangeValue = Partial<{
  from: Date;
  to: Date;
}>;

export type DatePreset = {
  id: string;
  label: string;
  getValue: () => DateRange;
};
