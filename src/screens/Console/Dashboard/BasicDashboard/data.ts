export type StoreNodeServer = {
    state?: string;
    endpoint?: string;
    drivePath?: string;
    totalSpace?: number;
    usedSpace?: number;
    availableSpace?: number;
}

export type BaseServer = {
    state?: string;
    endpoint?: string;
}