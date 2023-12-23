export enum MsgType {
    Reset,
    Play,
    Rewind,
    Commit,
    ChangeSize,
    Load,
    Connect,
    Text
}

export interface Message {
    originName: string,
    msgType: MsgType,
    content: string
}

export enum UserRole {
    Host,
    Player,
    Spectator
}