import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AnimeCard } from '../components/anime/AnimeCard';
import { Navbar } from '../components/common/Navbar';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AnimeDto } from '@ankirab/shared';

const mockAnime: AnimeDto = {
  id: 'anime-test-1',
  slug: 'solo-leveling',
  title: 'Solo Leveling: Arise',
  japaneseTitle: '俺だけレベルアップな件',
  englishTitle: 'Solo Leveling',
  synopsis: 'Sung Jinwoo ascends from the weakest hunter.',
  posterImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
  coverImage: null,
  bannerImage: null,
  format: 'TV',
  status: 'ONGOING',
  releaseYear: 2024,
  rating: 8.9,
  voteCount: 14200,
  episodeCount: 12,
  durationMinutes: 24,
  studio: 'A-1 Pictures',
  isFeatured: true,
  isTrending: true,
  hasHindiDub: true,
  hasEnglishDub: true,
  hasSubtitles: true,
  genres: [{ id: '1', name: 'Action', slug: 'action' }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('Frontend Components', () => {
  it('renders AnimeCard with title, format, rating, and Hindi-Dub badge', () => {
    render(
      <BrowserRouter>
        <AnimeCard anime={mockAnime} />
      </BrowserRouter>
    );

    expect(screen.getByText('Solo Leveling: Arise')).toBeInTheDocument();
    expect(screen.getByText('TV')).toBeInTheDocument();
    expect(screen.getByText('8.9')).toBeInTheDocument();
    expect(screen.getByText('HI-DUB')).toBeInTheDocument();
    expect(screen.getByText('EN-DUB')).toBeInTheDocument();
  });

  it('renders Navbar brand logo and primary navigation links', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('ANKI')).toBeInTheDocument();
    expect(screen.getByText('RAB')).toBeInTheDocument();
    expect(screen.getByText('Anime')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search anime/i)).toBeInTheDocument();
  });

  it('renders 404 page correctly', () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Lost in the Multiverse')).toBeInTheDocument();
  });
});
