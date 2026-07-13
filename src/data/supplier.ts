export const supplier = {
  name: "Xanh Xanh Urban Forest Co., Ltd",
  tagline: "Питомник растений из культуры ткани",
  location: "Ханой, Вьетнам",
  address: "No 01, 74 Goc De, Hoang Van Thu, Hoang Mai District, Ханой, Вьетнам",
  phone: "+84 372 096 139",
  email: "anh.lh@xanhxanhurbanforest.com",
  quotationDate: "2026-06-20",
  currency: "USD",
  incoterm: "EXW (INCOTERM 2020)",
};

export interface TermGroup {
  title: string;
  items: { label: string; value: string }[];
}

export const terms: TermGroup[] = [
  {
    title: "Товар и упаковка",
    items: [
      { label: "Единица", value: "Одно растение из культуры ткани (TC)" },
      { label: "Упаковка", value: "Пластиковый пакет по 10 штук" },
      {
        label: "В бутылке или отдельном пакете",
        value: "Растение в бутылке и в пакете, 1 шт.: +$0.30 / шт. Отдельный пакет или бутылку заказывайте за месяц.",
      },
    ],
  },
  {
    title: "Цены",
    items: [
      { label: "Валюта", value: "Доллары США (USD)" },
      { label: "Условия", value: "Цена EXW по INCOTERM 2020" },
      { label: "Срок действия", value: "Прайс действителен 30 дней с даты составления" },
      { label: "Тиры", value: "Цена за штуку снижается по пяти объёмным брекетам, от 05-09 до 100-299 шт." },
    ],
  },
  {
    title: "Заказ и оплата",
    items: [
      { label: "Предзаказ", value: "Заказанное количество готово за 3 месяца; депозит не менее 25% от суммы" },
      { label: "Депозит", value: "25% от суммы заказа резервируют заказ, если ETD дольше 15 дней" },
      { label: "Остаток", value: "Оплачивается банковским переводом за 10 дней до даты отгрузки" },
    ],
  },
];
