// TextPadDrawer.tsx
import React, { useState, useEffect } from "react";
import {
  Drawer,
  IconButton,
  TextField,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon, Save as SaveIcon } from "@mui/icons-material";
import { useUploadEnqueue } from "./app/transferQueue";

type TextPadDrawerProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  cwd: string;
  onUpload: () => void;
  editingFileName?: string | null; 
};

const TextPadDrawer = ({ open, setOpen, cwd, onUpload, editingFileName }: TextPadDrawerProps) => {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(false);
  const uploadEnqueue = useUploadEnqueue();

  useEffect(() => {
    if (open) {
      if (editingFileName) {
        // 修复2: 直接使用完整文件名，不去做容易引发Bug的字符串替换
        setNoteTitle(editingFileName);
        fetchOriginalContent(editingFileName);
      } else {
        setNoteTitle("");
        noteContent !== "" && setNoteContent("");
      }
    }
  }, [open, editingFileName]);

  const fetchOriginalContent = async (fileName: string) => {
    setLoading(true);
    try {
      const filePath = `${cwd === "/" ? "" : cwd}/${fileName}`;
      // 修复3: encodeURI 避免空格和特殊字符报错
      // 修复1: ?t=${Date.now()} 绕过 Cloudflare/浏览器缓存，确保拿到最新鲜的文本
      const targetUrl = `${encodeURI(`/webdav${filePath}`)}?t=${Date.now()}`;
      
      const response = await fetch(targetUrl);
      if (response.ok) {
        const text = await response.text();
        setNoteContent(text);
      } else {
        console.error("加载文本失败，状态码:", response.status);
      }
    } catch (err) {
      console.error("读取文件出错:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndUpload = async () => {
    // 修复2: 如果是编辑模式，强制使用原文件名覆盖；如果是新建模式，才自动补全 .txt
    const finalFileName = editingFileName 
      ? editingFileName 
      : (noteTitle.trim() ? `${noteTitle.trim()}.txt` : "Untitled.txt");

    if (!finalFileName.trim()) return;

    // 显式指定 utf-8 编码，防止中文出现乱码
    const file = new File([noteContent], finalFileName, {
      type: "text/plain;charset=utf-8",
    });

    uploadEnqueue({ file, basedir: cwd });

    setNoteTitle("");
    setNoteContent("");
    setOpen(false);
    onUpload();
  };

  return (
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
      <Box sx={{ width: 400, padding: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {editingFileName ? "编辑文件" : "新建 TextPad"}
          </Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TextField
              label="文件名称"
              fullWidth
              variant="outlined"
              margin="normal"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              disabled={!!editingFileName} // 编辑已有文件时禁止修改名称
            />
            <TextField
              label="文本内容"
              fullWidth
              multiline
              rows={18}
              variant="outlined"
              margin="normal"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleSaveAndUpload}
            >
              {editingFileName ? "保存修改" : "保存并上传"}
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default TextPadDrawer;
