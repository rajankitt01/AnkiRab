import { IMetadataProvider, ExternalAnimeMetadata } from './metadata.provider';

export class MockMetadataProvider implements IMetadataProvider {
  name = 'MockMetadata';

  private mockCatalog: ExternalAnimeMetadata[] = [
    {
      id: 'mock-1',
      title: {
        romaji: 'Kimetsu no Yaiba',
        english: 'Demon Slayer: Kimetsu no Yaiba',
        native: '鬼滅の刃'
      },
      synopsis: 'A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon.',
      posterImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop',
      format: 'TV',
      status: 'FINISHED',
      episodes: 26,
      duration: 24,
      genres: ['Action', 'Fantasy', 'Shounen'],
      averageScore: 8.9,
      year: 2019,
      studios: ['ufotable']
    },
    {
      id: 'mock-2',
      title: {
        romaji: 'Jujutsu Kaisen',
        english: 'Jujutsu Kaisen',
        native: '呪術廻戦'
      },
      synopsis: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself.',
      posterImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop',
      format: 'TV',
      status: 'FINISHED',
      episodes: 24,
      duration: 24,
      genres: ['Action', 'Supernatural', 'Fantasy'],
      averageScore: 8.7,
      year: 2020,
      studios: ['MAPPA']
    }
  ];

  async searchAnime(query: string): Promise<ExternalAnimeMetadata[]> {
    const q = query.toLowerCase();
    return this.mockCatalog.filter(item =>
      item.title.english?.toLowerCase().includes(q) ||
      item.title.romaji?.toLowerCase().includes(q)
    );
  }

  async getAnimeDetails(externalId: string | number): Promise<ExternalAnimeMetadata | null> {
    return this.mockCatalog.find(item => String(item.id) === String(externalId)) || null;
  }
}
