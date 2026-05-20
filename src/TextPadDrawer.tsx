import React, { useEffect, useState } from "react";
import { Drawer, Button, Input, message, Space } from "antd";

interface TextPadDrawerProps {
  open: boolean;
  onClose: () => void;
  filePath: string; // 当前文件完整路径，例如 /Folder/note.txt
  fileName: string;
}

export const TextPadDrawer: React.FC<TextPadDrawerProps> = ({
  open,
  onClose,
  filePath,
  fileName,
}) => {
  const [text, setText] = useState<string>("");
  const [originalText, setOriginalText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // 1. 打开 Drawer 时读取文件内容
  useEffect(() => {
    if (open && filePath) {
      fetchText();
    }
  }, [open, filePath]);

  const fetchText = async () => {
    setLoading(true);
    try {
      // 这里的路径需要根据项目实际的文本获取接口调整，通常可以直接 fetch 该文件的公开/鉴权链接
      const response = await fetch(`/webdav${filePath}`);
      if (response.ok) {
        const content = await response.text();
        setText(content);
        setOriginalText(content);
      } else {
        message.error("加载文件失败");
      }
    } catch (error) {
      console.error(error);
      message.error("加载文件出错");
    } finally {
      setLoading(false);
    }
  };

  // 2. 保存修改后的文本
  const handleSave = async () => {
    setSaving(true);
    try {
      // 将文本转换为 Blob 对象
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      
      // 方案：直接通过 WebDAV 的 PUT 请求覆盖原文件（项目自带 webdav 接口支持 PUT）
      const response = await fetch(`/webdav${filePath}`, {
        method: "PUT",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: blob,
      });

      if (response.ok) {
        message.success("保存成功");
        setOriginalText(text); // 更新原始文本对比基准
        setIsEditing(false);
        // 如果需要刷新外层的主文件列表，可以在此处调用从父组件传进来的 refresh() 函数
      } else {
        message.error("保存失败，服务器响应异常");
      }
    } catch (error) {
      console.error(error);
      message.error("保存过程中发生错误");
    } finally {
      setSaving(false);
    }
  };

  // 3. 取消编辑
  const handleCancel = () => {
    setText(originalText); // 恢复原内容
    setIsEditing(false);
  };

  return (
    <Drawer
      title={fileName}
      placement="right"
      onClose={onClose}
      open={open}
      width={700}
      extra={
        <Space>
          {!isEditing ? (
            <Button type="primary" onClick={() => setIsEditing(true)} disabled={loading}>
              编辑
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel}>取消</Button>
              <Button type="primary" onClick={handleSave} loading={saving}>
                确认保存
              </Button>
            </>
          )}
        </Space>
      }
    >
      {loading ? (
        <div>加载中...</div>
      ) : isEditing ? (
        <Input.TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={25}
          style={{ fontFamily: "monospace", fontSize: "14px" }}
        />
      ) : (
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", fontFamily: "monospace" }}>
          {text}
        </pre>
      )}
    </Drawer>
  );
};
