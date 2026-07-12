export const supplier = {
  name: "Xanh Xanh Urban Forest Co., Ltd",
  tagline: "Tissue-culture plant nursery",
  location: "Hanoi, Vietnam",
  address: "No 01, 74 Goc De, Hoang Van Thu, Hoang Mai District, Hanoi, Vietnam",
  phone: "+84 372 096 139",
  email: "anh.lh@xanhxanhurbanforest.com",
  quotationDate: "2026-07-01",
  currency: "USD",
  incoterm: "EXW (INCOTERM 2020)",
};

export interface TermGroup {
  title: string;
  items: { label: string; value: string }[];
}

export const terms: TermGroup[] = [
  {
    title: "Product & packaging",
    items: [
      { label: "Unit", value: "One TC (tissue-culture) plant" },
      { label: "Packaging", value: "Plastic bag of 10 pieces" },
      {
        label: "Bottle or single-bag",
        value: "Plant in bottle and in bag, 1 pc: +$0.30 / pc. Pre-order single bag or bottle one month ahead.",
      },
    ],
  },
  {
    title: "Pricing",
    items: [
      { label: "Currency", value: "US Dollars (USD)" },
      { label: "Terms", value: "EXW price, following INCOTERM 2020" },
      { label: "Validity", value: "Quotes are valid 30 days from the quotation date" },
      { label: "Tiers", value: "Unit price decreases across five quantity brackets, 05-09 to 100-299 pcs" },
    ],
  },
  {
    title: "Orders & payment",
    items: [
      { label: "Pre-order", value: "Ordered quantity is ready in 3 months; deposit at least 25% of the total" },
      { label: "Deposit", value: "25% of order value holds the order when ETD is longer than 15 days" },
      { label: "Balance", value: "Paid by wire transfer 10 days before the shipping date" },
    ],
  },
];
