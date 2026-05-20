import {
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Toolbar,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";
import {
  MoreHoriz as MoreHorizIcon,
  Check as CheckIcon,
  GridView,
  ViewList,
  SortByAlpha,
  CalendarToday,
  DataUsage,
} from "@mui/icons-material";

export type ViewMode = "grid" | "list";
export type SortMode = "name" | "date" | "size";

function Header({
  search,
  onSearchChange,
  setShowProgressDialog,
  viewMode = "grid",
  setViewMode,
  sortMode = "date",
  setSortMode,
}: {
  search: string;
  onSearchChange: (newSearch: string) => void;
  setShowProgressDialog: (show: boolean) => void;
  viewMode?: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
  sortMode?: SortMode;
  setSortMode?: (mode: SortMode) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const closeMenu = () => setAnchorEl(null);

  return (
    <Toolbar disableGutters sx={{ padding: 1 }}>
      <InputBase
        size="small"
        fullWidth
        placeholder="Search…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          backgroundColor: "whitesmoke",
          borderRadius: "999px",
          padding: "8px 16px",
        }}
      />
      <IconButton
        aria-label="More"
        color="inherit"
        sx={{ marginLeft: 0.5 }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <MoreHorizIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
      >
        {/* === 视图切换 === */}
        <MenuItem disabled sx={{ opacity: "1 !important", fontWeight: "bold" }}>
          View as
        </MenuItem>
        <MenuItem onClick={() => { setViewMode?.("grid"); closeMenu(); }}>
          <ListItemIcon><GridView fontSize="small" /></ListItemIcon>
          <ListItemText>Grid (网格)</ListItemText>
          {viewMode === "grid" && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem onClick={() => { setViewMode?.("list"); closeMenu(); }}>
          <ListItemIcon><ViewList fontSize="small" /></ListItemIcon>
          <ListItemText>List (列表)</ListItemText>
          {viewMode === "list" && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>

        <Divider />

        {/* === 排序切换 === */}
        <MenuItem disabled sx={{ opacity: "1 !important", fontWeight: "bold" }}>
          Sort by
        </MenuItem>
        <MenuItem onClick={() => { setSortMode?.("name"); closeMenu(); }}>
          <ListItemIcon><SortByAlpha fontSize="small" /></ListItemIcon>
          <ListItemText>Name (名称)</ListItemText>
          {sortMode === "name" && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem onClick={() => { setSortMode?.("date"); closeMenu(); }}>
          <ListItemIcon><CalendarToday fontSize="small" /></ListItemIcon>
          <ListItemText>Date (时间)</ListItemText>
          {sortMode === "date" && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem onClick={() => { setSortMode?.("size"); closeMenu(); }}>
          <ListItemIcon><DataUsage fontSize="small" /></ListItemIcon>
          <ListItemText>Size (大小)</ListItemText>
          {sortMode === "size" && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>

        <Divider />

        {/* === 原有的 Progress === */}
        <MenuItem
          onClick={() => {
            closeMenu();
            setShowProgressDialog(true);
          }}
        >
          <ListItemText>Progress (进度)</ListItemText>
        </MenuItem>
      </Menu>
    </Toolbar>
  );
}

export default Header;
