export type Account = {
  account_id: string;
  balances: Balance;
  mask: string;
  name: string;
  official_name: string;
  subtype: string;
  type: string;
};

type Balance = {
  available: number;
  current: number;
  iso_currency_code: string;
  limit?: number;
  unofficial_currency_code?: string;
};
