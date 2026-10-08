"use client";

import { useEffect } from "react";
import { Button, DatePicker, Drawer, Form, Input, InputNumber, Radio, Select, Space } from "antd";
import dayjs from "dayjs";
import { CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import { centsToYuan } from "@/lib/money";
import type { LedgerEntry } from "@/lib/entries";
import type { LedgerTag } from "@/lib/tags";

type EntryFormValues = {
  type: "expense" | "income";
  amount: number;
  date: dayjs.Dayjs;
  category: string;
  title?: string;
  paymentMethod?: string;
  note?: string;
  tagIds?: number[];
};

type EntryFormProps = {
  open: boolean;
  entry?: LedgerEntry | null;
  tags: LedgerTag[];
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
};

export function EntryForm({ open, entry, tags, onClose, onSubmit }: EntryFormProps) {
  const [form] = Form.useForm<EntryFormValues>();

  useEffect(() => {
    if (!open) return;

    if (entry) {
      form.setFieldsValue({
        type: entry.type,
        amount: Number(centsToYuan(entry.amount)),
        date: dayjs(entry.date),
        category: entry.category,
        title: entry.title ?? undefined,
        paymentMethod: entry.paymentMethod ?? undefined,
        note: entry.note ?? undefined,
        tagIds: entry.tags.map((tag) => tag.id),
      });
    } else {
      form.setFieldsValue({
        type: "expense",
        amount: undefined as unknown as number,
        date: dayjs(),
        category: "餐饮",
        title: undefined,
        paymentMethod: undefined,
        note: undefined,
        tagIds: [],
      });
    }
  }, [entry, form, open]);

  async function handleFinish(values: EntryFormValues) {
    await onSubmit({
      type: values.type,
      amount: values.amount,
      date: values.date.toISOString(),
      category: values.category,
      title: values.title,
      paymentMethod: values.paymentMethod,
      note: values.note,
      tagIds: values.tagIds ?? [],
      source: "manual",
    });
    form.resetFields();
  }

  return (
    <Drawer
      title={entry ? "编辑账目" : "添加账目"}
      open={open}
      onClose={onClose}
      width={460}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={() => form.submit()}>
            保存
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ type: "expense", category: "餐饮", date: dayjs() }}>
        <Form.Item name="type" label="类型" rules={[{ required: true }]}>
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="expense">支出</Radio.Button>
            <Radio.Button value="income">收入</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="amount" label="金额（元）" rules={[{ required: true, message: "请输入金额" }]}>
          <InputNumber min={0} precision={2} style={{ width: "100%" }} placeholder="35.00" />
        </Form.Item>

        <Form.Item name="date" label="日期时间" rules={[{ required: true, message: "请选择日期" }]}>
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="category" label="分类" rules={[{ required: true }]}>
          <Select options={CATEGORIES.map((category) => ({ value: category, label: category }))} />
        </Form.Item>

        <Form.Item name="title" label="标题/商户">
          <Input placeholder="午餐、超市、工资等" maxLength={100} />
        </Form.Item>

        <Form.Item name="paymentMethod" label="支付方式">
          <Select allowClear options={PAYMENT_METHODS.map((method) => ({ value: method.value, label: method.label }))} />
        </Form.Item>

        <Form.Item name="tagIds" label="标签">
          <Select mode="multiple" allowClear options={tags.map((tag) => ({ value: tag.id, label: tag.name }))} />
        </Form.Item>

        <Form.Item name="note" label="备注">
          <Input.TextArea rows={4} maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
