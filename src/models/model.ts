export interface Anime {
    id: string;
    seasonTags?: string | null;
}

export interface AnimeScore {
    id: string;
    score: number;
    anilist_score: number;
    myanimelist_id?: number;
    anilist_id?: number;
}
