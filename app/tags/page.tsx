"use client";

import { useEffect, useState } from "react";
import { App, Button, Card, ColorPicker, Empty, Form, Input, List, Modal, Popconfirm, Space, Tag, Typography, message } from "antd";
import type { Color } from "antd/es/color-picker";
import { AppHeader } from "@/components/AppHeader";
import type { LedgerTag } from "@/lib/tags";

export default function TagsPage() {
  const [messageApi] = message.useMessage();
  const [tags, setTags] = useState<LedgerTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<LedgerTag | null>(null);
  const [form] = Form.useForm<{ name: string; color: Color | string }>();

  async function loadTags() {
    setLoading(true);
    const response = await fetch("/api/tags");
    setTags(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void loadTags();
  }, []);

  function openCreate() {
    setEditingTag(null);
    form.setFieldsValue({ name: "", color: "#1677ff" });
    setModalOpen(true);
  }

  function openEdit(tag: LedgerTag) {
    setEditingTag(tag);
    form.setFieldsValue({ name: tag.name, color: tag.color });
    setModalOpen(true);
  }

  async function saveTag() {
    const values = await form.validateFields();
    const color = typeof values.color === "string" ? values.color : values.color.toHexString();
    const response = await fetch(editingTag ? `/api/tags/${editingTag.id}` : "/api/tags", {
      method: editingTag ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name, color }),
    });

    if (!response.ok) {
      messageApi.error("保存失败，标签名可能已存在");
      return;
    }
    messageApi.success("已保存");
    setModalOpen(false);
    await loadTags();
  }

  async function deleteTag(id: number) {
    const response = await fetch(`/api/tags/${id}`, { method: "DELETE" });
    if (!response.ok) {
      messageApi.error("删除失败");
      return;
    }
    messageApi.success("已删除");
    await loadTags();
  }

  return (
    <main className="page-shell">
      <AppHeader subtitle="管理账目标签，删除标签不会删除账目" />
      <Card
        title="标签管理"
        extra={
          <Button type="primary" onClick={openCreate}>
            新增标签
          </Button>
        }
      >
        {tags.length === 0 && !loading ? (
          <Empty description="还没有标签" />
        ) : (
          <List
            loading={loading}
            dataSource={tags}
            renderItem={(tag) => (
              <List.Item
                actions={[
                  <Button key="edit" size="small" onClick={() => openEdit(tag)}>
                    编辑
                  </Button>,
                  <Popconfirm key="delete" title="确认删除这个标签？" okText="删除" cancelText="取消" onConfirm={() => deleteTag(tag.id)}>
                    <Button size="small" danger>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={tag.color}>{tag.name}</Tag>
                      <Typography.Text type="secondary">{tag.entryCount} 笔账目</Typography.Text>
                    </Space>
                  }
                  description={`创建于 ${new Date(tag.createdAt).toLocaleString("zh-CN")}`}
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal title={editingTag ? "编辑标签" : "新增标签"} open={modalOpen} onOk={saveTag} onCancel={() => setModalOpen(false)} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="标签名" rules={[{ required: true, message: "请输入标签名" }]}>
            <Input maxLength={30} />
          </Form.Item>
          <Form.Item name="color" label="颜色" rules={[{ required: true }]}>
            <ColorPicker showText />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
