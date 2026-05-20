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
  onFileClick,
  // 👉 1. 接收从 Main 传来的视图模式
  viewMode = "grid",
}: {
  files: FileItem[];
  onCwdChange: (newCwd: string) => void;
  multiSelected: string[] | null;
  onMultiSelect: (key: string) => void;
  emptyMessage?: React.ReactNode;
  onFileClick?: (fileKey: string) => boolean;
  // 👉 2. 声明类型
  viewMode?: "grid" | "list"; 
}) {
  return files.length === 0 ? (
    <>{emptyMessage}</>
  ) : (
    <Grid container sx={{ paddingBottom: "48px" }}>
      {files.map((file) => (
        <Grid
          item
          key={file.key}
          // 👉 3. 核心变身魔法：如果是列表模式，所有屏幕尺寸下都占满整行（12列）；否则按网格排列
          xs={12}
          sm={viewMode === "list" ? 12 : 6}
          md={viewMode === "list" ? 12 : 4}
          lg={viewMode === "list" ? 12 : 3}
          xl={viewMode === "list" ? 12 : 2}
        >
          <ListItemButton
            selected={multiSelected?.includes(file.key)}
            onClick={() => {
              if (multiSelected !== null) {
                onMultiSelect(file.key);
              } else if (isDirectory(file)) {
                onCwdChange(file.key + "/");
              } else {
                if (onFileClick && onFileClick(file.key)) {
                  return; 
                }
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
            sx={{
              userSelect: "none",
              // 👉 4. 视觉优化：列表模式下加一条浅色底边框，让它看起来像个真正的标准列表
              borderBottom: viewMode === "list" ? "1px solid #f0f0f0" : "none",
              borderRadius: viewMode === "grid" ? 1 : 0, // 网格模式保留圆角
            }}
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
