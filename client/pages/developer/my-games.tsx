'use client';

import React, { useState } from 'react';
import { useGameMutations, useGetMyGames } from '@/customHooks/gameDev.hooks.query';
import { useDeleteConfirmation } from '@/sweetalert/DeleteConfirmation';
import { Game, Edition, Dlc } from '@/typescript/gameTypes';

// Modals
import { GameFormModal } from '@/components/game/GameFormModal';
import { EditionFormModal } from '@/components/game/EditionFormModal';
import { DlcFormModal } from '@/components/game/DlcFormModal';

import {
    Container,
    Typography,
    Button,
    Box,
    Card,
    CardContent,
    Stack,
    Divider,
    CircularProgress,
    Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useGenresQuery, useTagsQuery } from '@/customHooks/genre&tag.hooks.query';

type ModalState = {
    type: 'game' | 'edition' | 'dlc' | null;
    data?: Game | Edition | Dlc | null;
    gameId?: string;
};

export default function ManageGamesPage() {
    const { data: games = [], isLoading: gamesLoading, isError } = useGetMyGames();
    const { deleteGame, deleteEdition, deleteDLC } = useGameMutations();
    const { data: genres, isLoading: genresLoading } = useGenresQuery();
    const { data: tags, isLoading: tagsLoading } = useTagsQuery();

    const [modalState, setModalState] = useState<ModalState>({ type: null, data: null });

    const openModal = (
        type: ModalState['type'],
        data?: ModalState['data'],
        gameId?: string
    ) => {
        setModalState({ type, data, gameId });
    };

    const closeModal = () => setModalState({ type: null, data: null });

    // --- Delete handlers with correct Promise return types ---
    const handleDeleteGame = (id: string) => {
        const { showConfirmation } = useDeleteConfirmation(() => deleteGame(id));
        showConfirmation();
    };

    const handleDeleteEdition = (gameId: string, editionId: string) => {
        const { showConfirmation } = useDeleteConfirmation(() =>
            deleteEdition({ gameId, editionId })
        );
        showConfirmation();
    };

    const handleDeleteDlc = (gameId: string, dlcId: string) => {
        const { showConfirmation } = useDeleteConfirmation(() =>
            deleteDLC({ gameId, dlcId })
        );
        showConfirmation();
    };

    // Combine all loading states
    const isLoading = gamesLoading || genresLoading || tagsLoading;

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return (
            <Typography color="error" align="center" sx={{ p: 8 }}>
                Failed to load games. Please try again.
            </Typography>
        );
    }
    console.log('Available Genres:', genres);
    console.log('Available Tags:', tags);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h1">Manage My Games</Typography>
                <Button onClick={() => openModal('game', null)} variant="contained" startIcon={<AddIcon />}>
                    Add New Game
                </Button>
            </Box>

            <Stack spacing={4}>
                {games.map((game: Game) => (
                    <Card key={game._id} elevation={3}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Typography variant="h2" gutterBottom>
                                    {game.title}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        onClick={() => openModal('game', game)}
                                        size="small"
                                        variant="outlined"
                                        startIcon={<EditIcon />}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteGame(game._id)}
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                    >
                                        Delete
                                    </Button>
                                </Stack>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Editions */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h3">Editions</Typography>
                                    <Button
                                        onClick={() => openModal('edition', null, game._id)}
                                        size="small"
                                        color="success"
                                        startIcon={<AddCircleOutlineIcon />}
                                    >
                                        Add Edition
                                    </Button>
                                </Box>
                                <Stack spacing={1}>
                                    {game.editions?.map((edition: Edition) => (
                                        <Paper
                                            key={edition._id}
                                            variant="outlined"
                                            sx={{
                                                p: 1.5,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                bgcolor: 'rgba(0,0,0,0.2)',
                                            }}
                                        >
                                            <Typography variant="body1">
                                                {edition.name} - ${edition.price}
                                            </Typography>
                                            <Stack direction="row" spacing={1}>
                                                <Button onClick={() => openModal('edition', edition, game._id)} size="small" variant="text">
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteEdition(game._id, edition._id)}
                                                    size="small"
                                                    color="error"
                                                    variant="text"
                                                >
                                                    Delete
                                                </Button>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>

                            {/* DLCs */}
                            <Box sx={{ mt: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h3">DLCs</Typography>
                                    <Button
                                        onClick={() => openModal('dlc', null, game._id)}
                                        size="small"
                                        color="success"
                                        startIcon={<AddCircleOutlineIcon />}
                                    >
                                        Add DLC
                                    </Button>
                                </Box>
                                <Stack spacing={1}>
                                    {game.dlcs?.map((dlc: Dlc) => (
                                        <Paper
                                            key={dlc._id}
                                            variant="outlined"
                                            sx={{
                                                p: 1.5,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                bgcolor: 'rgba(0,0,0,0.2)',
                                            }}
                                        >
                                            <Typography variant="body1">
                                                {dlc.title} - {dlc.price > 0 ? `$${dlc.price}` : 'Free'}
                                            </Typography>
                                            <Stack direction="row" spacing={1}>
                                                <Button onClick={() => openModal('dlc', dlc, game._id)} size="small" variant="text">
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteDlc(game._id, dlc._id)}
                                                    size="small"
                                                    color="error"
                                                    variant="text"
                                                >
                                                    Delete
                                                </Button>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            <GameFormModal
                key={modalState.data?._id || 'new-game'}
                isOpen={modalState.type === 'game'}
                onClose={closeModal}
                gameToEdit={modalState.type === 'game' ? (modalState.data as Game) : null}
                availableGenres={genres || []}
                availableTags={tags || []}
            />
            <EditionFormModal
                isOpen={modalState.type === 'edition'}
                onClose={closeModal}
                gameId={modalState.gameId ?? ''}
                editionToEdit={modalState.type === 'edition' ? (modalState.data as Edition) : null}
                availableDlcs={games.find((g) => g._id === modalState.gameId)?.dlcs ?? []}
            />
            <DlcFormModal
                isOpen={modalState.type === 'dlc'}
                onClose={closeModal}
                gameId={modalState.gameId ?? ''}
                dlcToEdit={modalState.type === 'dlc' ? (modalState.data as Dlc) : null}
            />
        </Container>
    );
}