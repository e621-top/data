export type Category = "character" | "artist"

export interface APITag {
    id: number
    name: string
    post_count: number
    related_tags: string
    related_tags_updated_at: string
    category: number
    is_locked: boolean
    created_at: string
    updated_at: string
}

export interface Tag {
    id: number
    name: string
    post_count: number
    created_at: string
    position: number
    post_delta?: number
}

export interface Data {
    updated_at: Date
    tags: Tag[]
}
