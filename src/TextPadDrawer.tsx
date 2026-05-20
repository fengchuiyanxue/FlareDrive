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
        setNoteTitle(editingFileName);
        fetchOriginalContent(editingFileName);
      } else {
        setNoteTitle("");
        if (noteContent !== "") {
          setNoteContent("");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingFileName]);

  const fetchOriginalContent = async (fileName: string) => {
    setLoading(true);
    try {
      // 👉 优化：确保路径正确，兼容根目录和子文件夹
      const safeCwd = cwd.endsWith("/") ? cwd : (cwd ? cwd + "/" : "");
      const fileKey = `${safeCwd}${fileName}`;

      // 将路径中可能存在的中文或空格进行标准化 URL 编码
      const encodedKey = fileKey.split("/").map(encodeURIComponent).join("/");
      const targetUrl = `/webdav/${encodedKey}`;
      
      // 👉 核心修复：去掉了 URL 后面的 ?t=xxx，改用标准 cache 属性绕过缓存
      const response = await fetch(targetUrl, {
        cache: "no-store", // 强制浏览器每次都向服务器请求最新内容
      });

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
    const finalFileName = editingFileName 
      ? editingFileName 
      : (noteTitle.trim() ? `${noteTitle.trim()}.txt` : "Untitled.txt");

    if (!finalFileName.trim()) return;

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
              disabled={!!editingFileName} 
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
