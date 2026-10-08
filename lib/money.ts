export function centsToYuan(amount: number) {
  return (amount / 100).toFixed(2);
}

export function formatCurrency(amount: number) {
  return `¥${centsToYuan(amount)}`;
}

export function yuanToCents(value: number | string) {
  const normalized = String(value).trim();
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    throw new Error("金额最多支持两位小数");
  }

  const [yuan, fraction = ""] = normalized.split(".");
  return Number(yuan) * 100 + Number(fraction.padEnd(2, "0"));
}
