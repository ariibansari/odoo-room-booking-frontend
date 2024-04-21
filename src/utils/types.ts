export type Tag = {
    tag_id: number,
    tag_name: string
}
type TagRef = {
    tag_ref: Tag
}
export type Room = {
    room_id: number,
    room_name: string,
    room_description: string,
    room_capacity: number,
    Tags: TagRef[]
}