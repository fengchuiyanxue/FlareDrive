import React from "react";
import {
  Box,
  Grid,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MimeIcon from "./MimeIcon";
import { humanReadableSize } from "./app/utils";

export interface FileItem {
  key: string;
  size: number;
  uploaded: string;
  httpMetadata: { contentType: string };
  customMetadata?: { thumbnail?: string };
}

function extractFilename(key: string) {
  return key.split("/").pop();
}

export function encodeKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

export function isDirectory(file: FileItem) {
  return file.httpMetadata?.contentType === "application/x-directory";
}

function FileGrid({
  files,
  onCwdChange,
  multiSelected,
  onMultiSelect,
  emptyMessage,
  onFileClick, // 👉 新增：接收从 Main.tsx 传过来的点击事件
}: {
  files: FileItem[];
  onCwdChange: (newCwd: string) => void;
  multiSelected: string[] | null;
  onMultiSelect: (key: string) => void;
  emptyMessage?: React.ReactNode;
  onFileClick?: (fileKey: string) => boolean; // 👉 新增：定义类型，返回 boolean 表示是否已拦截
}) {
  return files.length === 0 ? (
    emptyMessage
  ) : (
    <Grid container sx={{ paddingBottom: "48px" }}>
      {files.map((file) => (
        <Grid item key={file.key} xs={12} sm={6} md={4} lg={3} xl={2}>
          <ListItemButton
            selected={multiSelected?.includes(file.key)}
            onClick={() => {
              if (multiSelected !== null) {
                onMultiSelect(file.key);
              } else if (isDirectory(file)) {
                onCwdChange(file.key + "/");
              } else {
                // 👉 新增核心逻辑：如果是文件，先问问外层（Main）要不要拦截它
                if (onFileClick && onFileClick(file.key)) {
                  return; // 如果 Main.tsx 返回 true（说明是 txt 并且弹出了抽屉），就终止执行，不跳新页面
                }
                // 否则（比如是图片、视频），继续走默认的新标签页打开逻辑
                window.open(
                  `/webdav/${encodeKey(file.key)}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              onMultiSelect(file.key);
            }}
            sx={{ userSelect: "none" }}
          >
            <ListItemIcon>
              {file.customMetadata?.thumbnail ? (
                <img
                  src={`/webdav/_$flaredrive$/thumbnails/${file.customMetadata.thumbnail}.png`}
                  alt={file.key}
                  style={{ width: 36, height: 36, objectFit: "cover" }}
                />
              ) : (
                <MimeIcon contentType={file.httpMetadata.contentType} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={extractFilename(file.key)}
              primaryTypographyProps={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              secondary={
                <React.Fragment>
                  <Box
                    sx={{
                      display: "inline-block",
                      minWidth: "160px",
                      marginRight: 1,
                    }}
                  >
                    {new Date(file.uploaded).toLocaleString()}
                  </Box>
                  {!isDirectory(file) && humanReadableSize(file.size)}
                </React.Fragment>
              }
            />
          </ListItemButton>
        </Grid>
      ))}
    </Grid>
  );
}

export default FileGrid;
