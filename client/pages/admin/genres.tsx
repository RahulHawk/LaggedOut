import { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, IconButton, CircularProgress } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router'; // ADDED: To handle redirects
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { Sidebar } from '@/components/Sidebar/Sidebar';
import { GenreFormModal } from '@/components/admin/GenreFormModal';
import { useGenresQuery, useAddGenreMutation, useUpdateGenreMutation, useDeleteGenreMutation } from '@/customHooks/genre&tag.hooks.query';
import { useAuth } from '@/customHooks/auth.hooks.query'; // ADDED: To check the user's role
import { Genre } from '@/typescript/homeTypes';

const MySwal = withReactContent(Swal);

const ManageGenresPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
    
    // --- ADDED: Authorization Logic ---
    const router = useRouter();
    // Assuming useAuth provides a loading state for the initial auth check
    const { user, isLoggedIn, loading: isAuthLoading } = useAuth(); 

    useEffect(() => {
        // After the initial auth check is complete...
        if (!isAuthLoading) {
            // If the user is not logged in OR their role is not 'admin', redirect them.
            if (!isLoggedIn || user?.role !== 'admin') {
                router.push('/'); // Redirect to the homepage
            }
        }
    }, [isLoggedIn, user, isAuthLoading, router]);
    // --- End of Authorization Logic ---

    // Fetching and mutation hooks
    const { data: genresResult, isLoading } = useGenresQuery();
    const addGenre = useAddGenreMutation();
    const updateGenre = useUpdateGenreMutation();
    const deleteGenre = useDeleteGenreMutation();

    const handleOpenModal = (genre: Genre | null = null) => {
        setEditingGenre(genre);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGenre(null);
    };

    const handleFormSubmit = (name: string) => {
        if (editingGenre) {
            updateGenre.mutate({ id: editingGenre._id, name });
        } else {
            addGenre.mutate(name);
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        MySwal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteGenre.mutate(id);
            }
        });
    };

    // --- ADDED: Loading and Access Denied States ---
    // While checking auth, show a loader
    if (isAuthLoading || !isLoggedIn || user?.role !== 'admin') {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }
    
    // If the user is confirmed an admin, show the page content
    return (
        <>
            <Head><title>Manage Genres | Admin</title></Head>
            <Box display="flex">
                <Sidebar categories={[]} /> {/* Pass appropriate props */}
                <Box sx={{ flex: 1, p: 4, marginLeft: '240px' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4">Manage Genres</Typography>
                        <Button variant="contained" onClick={() => handleOpenModal()}>
                            Add New Genre
                        </Button>
                    </Box>

                    {isLoading ? (
                        <Typography>Loading genres...</Typography>
                    ) : (
                        <List>
                            {genresResult?.map((genre) => (
                                <ListItem
                                    key={genre._id}
                                    secondaryAction={
                                        <>
                                            <IconButton edge="end" aria-label="edit" onClick={() => handleOpenModal(genre)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(genre._id)} sx={{ ml: 1 }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    }
                                >
                                    <ListItemText primary={genre.name} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>

            <GenreFormModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
                initialData={editingGenre}
            />
        </>
    );
};

export default ManageGenresPage;