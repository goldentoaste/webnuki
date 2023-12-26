export enum MsgType {
    Reset,
    Play,
    Rewind,
    Commit,
    ChangeSize,
    Load,
    Connect,
    Text,
    PlayerInfo,
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

export interface ChatItem {
    role?: UserRole,
    color?: number,
    content: string,
    name?: string
}


export interface PlayersInfo {
    hostName: string,
    clientName: string,
    
}