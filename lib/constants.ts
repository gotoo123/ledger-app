export const ENTRY_TYPES = ["expense", "income"] as const;
export const ENTRY_SOURCES = ["manual", "text", "voice", "image"] as const;

export const CATEGORIES = [
  "餐饮",
  "交通",
  "购物",
  "住房",
  "娱乐",
  "医疗",
  "教育",
  "工资",
  "其他",
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "现金" },
  { value: "wechat", label: "微信" },
  { value: "alipay", label: "支付宝" },
  { value: "card", label: "银行卡" },
  { value: "other", label: "其他" },
] as const;

export const DEFAULT_TAG_COLORS = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#eb2f96",
  "#722ed1",
  "#13c2c2",
] as const;
