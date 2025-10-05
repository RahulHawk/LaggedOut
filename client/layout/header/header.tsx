"use client";

import * as React from "react";
import { useRef } from "react";
import {
    AppBar, Toolbar, Typography, Button, Tooltip, Menu, MenuItem, IconButton, Badge, Box, Avatar,
    ListItemIcon, InputBase, styled, alpha, Fade, Popper, Paper, ClickAwayListener, List,
    ListItem, ListItemAvatar, ListItemText, CircularProgress
} from "@mui/material";
import {
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    Favorite as FavoriteIcon,
    ShoppingCart as ShoppingCartIcon,
    AccountCircle as AccountCircleIcon,
    Login as LoginIcon,
    AppRegistration as AppRegistrationIcon,
    Logout as LogoutIcon,
} from "@mui/icons-material";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/customHooks/auth.hooks.query";
import { useGamesQuery } from "@/customHooks/home.hooks.query";
import { useDebounce } from "@/customHooks/useDebounce";
import { useWishlist } from "@/customHooks/misc.hooks.query";
import { WishlistItem } from "@/typescript/homeTypes";
import { useCartQuery } from "@/customHooks/commerce.hooks.query";
import { useNotificationsQuery, useMarkAsReadMutation } from "@/customHooks/notification.hooks.query";
import { NotificationDropdown } from "@/components/header/NotificationDropdown";

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.25) },
    marginLeft: theme.spacing(1),
    width: "100%",
    [theme.breakpoints.up("sm")]: { width: "auto" },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("md")]: { width: "20ch" },
    },
}));

export const Header: React.FC = () => {
    const router = useRouter();
    const { user, isLoggedIn, handleLogout } = useAuth();
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    const searchAnchorRef = useRef<HTMLDivElement>(null);
    const [isDropdownOpen, setDropdownOpen] = React.useState(false);

    const [anchorElNotifications, setAnchorElNotifications] = React.useState<null | HTMLElement>(null);

    const { data: notifications } = useNotificationsQuery();
    const { mutate: markAsRead } = useMarkAsReadMutation();

    // --- Local state for instant counter update ---
    const [localNotifications, setLocalNotifications] = React.useState(notifications || []);
    React.useEffect(() => {
        setLocalNotifications(notifications || []);
    }, [notifications]);

    const unreadCount = localNotifications?.filter(n => !n.read).length || 0;

    const { data: wishlistData } = useWishlist<WishlistItem[]>();
    const { data: cartData } = useCartQuery({ enabled: isLoggedIn });

    const wishlistCount = wishlistData?.length || 0;
    const cartCount = cartData?.cart?.length || 0;

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);

    const onLogout = async () => {
        await handleLogout();
        handleCloseUserMenu();
        router.push("/auth/login");
    };

    const handleOpenNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNotifications(event.currentTarget);
    const handleCloseNotificationsMenu = () => setAnchorElNotifications(null);

    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const { data: searchResults, isLoading: isSearchLoading } = useGamesQuery(
        { search: debouncedSearchQuery, limit: 5 },
        { enabled: !!debouncedSearchQuery && isDropdownOpen }
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setDropdownOpen(false);
        if (searchQuery.trim()) {
            router.push(`/store?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const displayName = isLoggedIn
        ? user?.userName || user?.firstName || "User"
        : "Guest";

    return (
        <>
            <AppBar position="fixed" sx={{ backgroundColor: "#172121", zIndex: 1201 }}>
                <Toolbar sx={{ justifyContent: "space-between", px: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 2 }}>
                        <Typography
                            variant="h6"
                            noWrap
                            onClick={() => router.push("/")}
                            sx={{ cursor: "pointer", fontWeight: 700, letterSpacing: ".2rem" }}
                        >
                            LaggedOut
                        </Typography>

                        {/* --- Role-Based Navigation Links --- */}
                        {isLoggedIn && user?.role === 'admin' ? (
                            <>
                                <Button color="inherit" onClick={() => router.push("/")}>Store</Button>
                                <Button color="inherit" onClick={() => router.push("/admin/dashboard")}>Dashboard</Button>
                            </>
                        ) : isLoggedIn && user?.role === 'developer' ? (
                            <>
                                <Button color="inherit" onClick={() => router.push("/auth/profile")}>Dashboard</Button>
                                <Button color="inherit" onClick={() => router.push("/developer/my-games")}>My Games</Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" onClick={() => router.push("/")}>Store</Button>
                                {isLoggedIn && <Button color="inherit" onClick={() => router.push("/library")}>Library</Button>}
                                {isLoggedIn && <Button color="inherit" onClick={() => router.push("/forum")}>Community</Button>}
                            </>
                        )}
                        {/* --- End of Section --- */}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 5 }}>
                        <Tooltip title="Account settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar src={isLoggedIn ? user?.profile?.profilePic : undefined}>
                                    {!isLoggedIn && <AccountCircleIcon />}
                                </Avatar>
                                <Typography sx={{ color: "#fff", ml: 1, display: { xs: "none", sm: "inline" } }}>
                                    {displayName}
                                </Typography>
                            </IconButton>
                        </Tooltip>

                        <Menu
                            anchorEl={anchorElUser}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                            disableScrollLock={true}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                            TransitionComponent={Fade}
                            transitionDuration={300}
                            sx={{ "& .MuiPaper-root": { backgroundColor: "#2a3a4b", color: "#fff", borderRadius: "8px", minWidth: "180px", marginTop: "8px", boxShadow: "0px 5px 15px rgba(0,0,0,0.5)" } }}
                        >
                            {/* Role-based menu items (unchanged) */}
                            {isLoggedIn && user?.role === 'admin' ? (
                                [
                                    <MenuItem key="dashboard" onClick={() => { handleCloseUserMenu(); router.push("/admin/dashboard"); }}>Dashboard</MenuItem>,
                                    <MenuItem key="logout" onClick={onLogout}>
                                        <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: "#fff" }} /></ListItemIcon>
                                        Sign Out
                                    </MenuItem>
                                ]
                            ) : isLoggedIn && user?.role === 'developer' ? (
                                [
                                    <MenuItem key="dashboard" onClick={() => { handleCloseUserMenu(); router.push("/auth/profile"); }}>Dashboard</MenuItem>,
                                    <MenuItem key="public-profile" onClick={() => { handleCloseUserMenu(); router.push(`/developer/${user.id}`); }}>Public Profile</MenuItem>,
                                    <MenuItem key="followers" onClick={() => { handleCloseUserMenu(); router.push(`/developer/followers/${user.id}`); }}>Followers</MenuItem>,
                                    <MenuItem key="logout" onClick={onLogout}>
                                        <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: "#fff" }} /></ListItemIcon>
                                        Sign Out
                                    </MenuItem>
                                ]
                            ) : isLoggedIn ? (
                                [
                                    <MenuItem key="profile" onClick={() => { handleCloseUserMenu(); router.push("/auth/profile"); }}>Profile</MenuItem>,
                                    <MenuItem key="friends" onClick={() => { handleCloseUserMenu(); router.push("/friends"); }}>Friends</MenuItem>,
                                    <MenuItem key="inventory" onClick={() => { handleCloseUserMenu(); router.push("/inventory"); }}>Inventory</MenuItem>,
                                    <MenuItem key="badges" onClick={() => { handleCloseUserMenu(); router.push("/achievements"); }}>Achievements</MenuItem>,
                                    <MenuItem key="activity" onClick={() => { handleCloseUserMenu(); router.push("/activity"); }}>Activity Log</MenuItem>,
                                    <MenuItem key="logout" onClick={onLogout}>
                                        <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: "#fff" }} /></ListItemIcon>
                                        Sign Out
                                    </MenuItem>
                                ]
                            ) : (
                                [
                                    <MenuItem key="login" onClick={() => { handleCloseUserMenu(); router.push("/auth/login"); }}>
                                        <ListItemIcon><LoginIcon fontSize="small" sx={{ color: "#fff" }} /></ListItemIcon>
                                        Login
                                    </MenuItem>,
                                    <MenuItem key="register" onClick={() => { handleCloseUserMenu(); router.push("/auth/register"); }}>
                                        <ListItemIcon><AppRegistrationIcon fontSize="small" sx={{ color: "#fff" }} /></ListItemIcon>
                                        Register
                                    </MenuItem>
                                ]
                            )}
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Toolbar />

            {isHomePage && (
                <AppBar position="relative" sx={{ backgroundColor: "#1b2838", top: 0 }}>
                    <Toolbar sx={{ justifyContent: "space-between", px: { xs: 1, md: 5, lg: 10 } }}>
                        <Box component="form" onSubmit={handleSearch} sx={{ width: "55%", ml: "450px", }} ref={searchAnchorRef}>
                            <Search>
                                <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Search games…"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setDropdownOpen(!!e.target.value);
                                    }}
                                    inputProps={{ "aria-label": "search" }}
                                />
                            </Search>
                        </Box>
                        {isLoggedIn && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <IconButton color="inherit" onClick={() => router.push("/wishlist")}>
                                    <Badge badgeContent={wishlistCount} color="secondary"><FavoriteIcon /></Badge>
                                </IconButton>
                                <IconButton color="inherit" onClick={() => router.push("/cart")}>
                                    <Badge badgeContent={cartCount} color="primary"><ShoppingCartIcon /></Badge>
                                </IconButton>
                                <IconButton color="inherit" onClick={handleOpenNotificationsMenu}>
                                    <Badge badgeContent={unreadCount} color="error">
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>
                            </Box>)}
                    </Toolbar>
                </AppBar>
            )}

            <NotificationDropdown
                anchorEl={anchorElNotifications}
                open={Boolean(anchorElNotifications)}
                onClose={handleCloseNotificationsMenu}
            />

            <Popper
                open={isDropdownOpen && !!debouncedSearchQuery}
                anchorEl={searchAnchorRef.current}
                placement="bottom-start"
                transition
                sx={{ zIndex: 1300, width: searchAnchorRef.current?.clientWidth }}
                disablePortal
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={250}>
                        <Paper sx={{ mt: 1, bgcolor: '#2a3a4b', color: '#fff' }}>
                            <ClickAwayListener onClickAway={() => setDropdownOpen(false)}>
                                <List>
                                    {isSearchLoading && (<ListItem><CircularProgress size={20} sx={{ mx: 'auto' }} /></ListItem>)}
                                    {!isSearchLoading && Array.isArray(searchResults?.data) && searchResults.data.map((game) => (
                                        <MenuItem key={game._id} onClick={() => { setDropdownOpen(false); router.push(`/games/${game._id}`); }}>
                                            <ListItemAvatar><Avatar variant="square" src={game.coverImage} /></ListItemAvatar>
                                            <ListItemText primary={game.title} />
                                        </MenuItem>
                                    ))}
                                    {!isSearchLoading && searchResults?.data?.length === 0 && (<ListItem><ListItemText primary={`No results for "${debouncedSearchQuery}"`} /></ListItem>)}
                                </List>
                            </ClickAwayListener>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </>
    );
};
