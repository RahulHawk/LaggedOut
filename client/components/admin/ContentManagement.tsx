'use client';

import React, { useState, useMemo } from 'react';
import { useDeleteConfirmation } from '@/sweetalert/DeleteConfirmation';
// Import all the necessary hooks
import { useGenresQuery, useAddGenreMutation, useUpdateGenreMutation, useDeleteGenreMutation } from '@/customHooks/genre&tag.hooks.query';
import { useTagsQuery, useAddTagMutation, useUpdateTagMutation, useDeleteTagMutation } from '@/customHooks/genre&tag.hooks.query';
import { useListAllAchievementsQuery } from '@/customHooks/achievement.hooks.query'; // The hook we just fixed

// Import all the necessary modals
import { GenreFormModal } from './GenreFormModal';
import { TagFormModal } from './TagFormModal';
import { CreateBadgeModal } from './CreateBadgeModal';
import { CreateAchievementModal } from './CreateAchievementModal';

import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box, Typography, CircularProgress, Avatar } from '@mui/material';
import { Genre, Tag } from '@/typescript/homeTypes';
import { Badge, Achievement } from '@/typescript/achievementTypes';

export const ContentManagement = () => {
    // --- Data Fetching ---
    const { data: genres, isLoading: genresLoading } = useGenresQuery();
    const { data: tags, isLoading: tagsLoading } = useTagsQuery();
    const { data: achievements, isLoading: achievementsLoading } = useListAllAchievementsQuery();

    const uniqueBadges = useMemo(() => {
        if (!achievements) return [];
        const badgeMap = new Map<string, Badge>();
        achievements.forEach(ach => {
            if (ach.badge && !badgeMap.has(ach.badge._id)) {
                badgeMap.set(ach.badge._id, ach.badge);
            }
        });
        return Array.from(badgeMap.values());
    }, [achievements]);

    // --- State for Modals ---
    const [genreModal, setGenreModal] = useState({ open: false, data: null as Genre | null });
    const [tagModal, setTagModal] = useState({ open: false, data: null as Tag | null });
    const [badgeModalOpen, setBadgeModalOpen] = useState(false);
    const [achievementModalOpen, setAchievementModalOpen] = useState(false);

    // --- Mutations ---
    const { mutate: addGenre } = useAddGenreMutation();
    const { mutate: updateGenre } = useUpdateGenreMutation();
    const { mutateAsync: deleteGenre } = useDeleteGenreMutation();
    const { mutate: addTag } = useAddTagMutation();
    const { mutate: updateTag } = useUpdateTagMutation();
    const { mutateAsync: deleteTag } = useDeleteTagMutation();

    // --- Handlers ---
    const handleGenreSubmit = (name: string) => {
        if (genreModal.data) {
            updateGenre({ id: genreModal.data._id, name });
        } else {
            addGenre(name);
        }
        setGenreModal({ open: false, data: null });
    };

    const handleDeleteGenre = (id: string) => {
        const { showConfirmation } = useDeleteConfirmation(() => deleteGenre(id));
        showConfirmation();
    };

    const handleTagSubmit = (name: string) => {
        if (tagModal.data) {
            updateTag({ id: tagModal.data._id, name });
        } else {
            addTag(name);
        }
        setTagModal({ open: false, data: null });
    };

    const handleDeleteTag = (id: string) => {
        const { showConfirmation } = useDeleteConfirmation(() => deleteTag(id));
        showConfirmation();
    };
    
    const isLoading = genresLoading || tagsLoading || achievementsLoading;

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Genre Management */}
            <Paper>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Typography variant="h5">Genres</Typography>
                    <Button onClick={() => setGenreModal({ open: true, data: null })}>Add Genre</Button>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead><TableRow><TableCell>Name</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                        <TableBody>
                            {genres?.map((genre) => (
                                <TableRow key={genre._id}>
                                    <TableCell>{genre.name}</TableCell>
                                    <TableCell align="right">
                                        <Button size="small" onClick={() => setGenreModal({ open: true, data: genre })}>Edit</Button>
                                        <Button size="small" color="error" onClick={() => handleDeleteGenre(genre._id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Tag Management */}
            <Paper>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Typography variant="h5">Tags</Typography>
                    <Button onClick={() => setTagModal({ open: true, data: null })}>Add Tag</Button>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead><TableRow><TableCell>Name</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                        <TableBody>
                            {tags?.map((tag: Tag) => (
                                <TableRow key={tag._id}>
                                    <TableCell>{tag.name}</TableCell>
                                    <TableCell align="right">
                                        <Button size="small" onClick={() => setTagModal({ open: true, data: tag })}>Edit</Button>
                                        <Button size="small" color="error" onClick={() => handleDeleteTag(tag._id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Badge Management */}
            <Paper>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Typography variant="h5">Badges</Typography>
                    <Button onClick={() => setBadgeModalOpen(true)}>Create New Badge</Button>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead><TableRow><TableCell>Image</TableCell><TableCell>Name</TableCell><TableCell>Description</TableCell></TableRow></TableHead>
                        <TableBody>
                            {uniqueBadges.map((badge) => (
                                <TableRow key={badge._id}>
                                    <TableCell><Avatar src={badge.image} /></TableCell>
                                    <TableCell>{badge.name}</TableCell>
                                    <TableCell>{badge.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Achievement Management */}
            <Paper>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Typography variant="h5">Achievements</Typography>
                    <Button onClick={() => setAchievementModalOpen(true)}>Create New Achievement</Button>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Condition</TableCell><TableCell>Badge</TableCell></TableRow></TableHead>
                        <TableBody>
                            {achievements?.map((ach) => (
                                <TableRow key={ach._id}>
                                    <TableCell>{ach.name}</TableCell>
                                    <TableCell><code>{ach.condition}</code></TableCell>
                                    <TableCell>{ach.badge ? `${ach.badge.name} (${ach.badge._id})` : 'None'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Modals */}
            <GenreFormModal open={genreModal.open} onClose={() => setGenreModal({ open: false, data: null })} onSubmit={handleGenreSubmit} initialData={genreModal.data} />
            <TagFormModal open={tagModal.open} onClose={() => setTagModal({ open: false, data: null })} onSubmit={handleTagSubmit} initialData={tagModal.data} />
            <CreateBadgeModal open={badgeModalOpen} onClose={() => setBadgeModalOpen(false)} />
            <CreateAchievementModal open={achievementModalOpen} onClose={() => setAchievementModalOpen(false)} />
        </Box>
    );
};