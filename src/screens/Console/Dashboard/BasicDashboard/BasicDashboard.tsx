// This file is part of MinIO Console Server
// Copyright (c) 2022 MinIO, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import React from "react";
import {Box, breakPoints, DrivesIcon, ServersIcon,} from "mds";
import StatusCountCard from "./StatusCountCard";
import BaseServersList from "./BaseServersList";
import {AdminInfoResponse} from "api/consoleApi";
import StoreServersList from "./StoreServersList";

const BoxItem = ({children}: { children: any }) => {
    return (
        <Box
            withBorders
            sx={{
                padding: 15,
                height: "136px",
                maxWidth: "100%",
                [`@media (max-width: ${breakPoints.sm}px)`]: {
                    padding: 5,
                    maxWidth: "initial",
                },
            }}
        >
            {children}
        </Box>
    );
};

interface IDashboardProps {
    usage: AdminInfoResponse | undefined;
}

const getServersList = (usage: AdminInfoResponse | undefined) => {
    if (usage && usage.servers) {
        return [...usage.servers].sort(function (a, b) {
            const nameA = a.endpoint?.toLowerCase() || "";
            const nameB = b.endpoint?.toLowerCase() || "";
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
    }

    return [];
};


const BasicDashboard = ({usage}: IDashboardProps) => {
    const serverList = getServersList(usage);
    const storeNodeServer = usage?.store_servers;
    return (
        <Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateRows: "1fr",
                    gridTemplateColumns: "1fr",
                    gap: 27,
                    marginBottom: 40,
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: "40px",
                    }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateRows: "136px",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 20,
                            [`@media (max-width: ${breakPoints.sm}px)`]: {
                                gridTemplateColumns: "1fr",
                            },
                            [`@media (max-width: ${breakPoints.md}px)`]: {
                                marginBottom: 0,
                            },
                        }}
                    >
                        {/*<BoxItem>*/}
                        {/*    <CounterCard*/}
                        {/*        label={"buckets"}*/}
                        {/*        icon={<BucketsIcon/>}*/}
                        {/*        counterValue={usage ? representationNumber(usage.buckets) : 0}*/}
                        {/*        actions={*/}
                        {/*            <Link*/}
                        {/*                to={IAM_PAGES.BUCKETS}*/}
                        {/*                style={{*/}
                        {/*                    zIndex: 3,*/}
                        {/*                    textDecoration: "none",*/}
                        {/*                    top: "40px",*/}
                        {/*                    position: "relative",*/}
                        {/*                    marginRight: "75px",*/}
                        {/*                }}*/}
                        {/*            >*/}
                        {/*                <TooltipWrapper tooltip={"Browse"}>*/}
                        {/*                    <Button*/}
                        {/*                        id={"browse-dashboard"}*/}
                        {/*                        onClick={() => {*/}
                        {/*                        }}*/}
                        {/*                        label={"Browse"}*/}
                        {/*                        icon={<ArrowRightIcon/>}*/}
                        {/*                        variant={"regular"}*/}
                        {/*                        style={{*/}
                        {/*                            padding: 5,*/}
                        {/*                            height: 30,*/}
                        {/*                            fontSize: 14,*/}
                        {/*                            marginTop: 20,*/}
                        {/*                        }}*/}
                        {/*                    />*/}
                        {/*                </TooltipWrapper>*/}
                        {/*            </Link>*/}
                        {/*        }*/}
                        {/*    />*/}
                        {/*</BoxItem>*/}
                        {/*<BoxItem>*/}
                        {/*    <CounterCard*/}
                        {/*        label={"objects"}*/}
                        {/*        icon={<TotalObjectsIcon/>}*/}
                        {/*        counterValue={usage ? representationNumber(usage.objects) : 0}*/}
                        {/*    />*/}
                        {/*</BoxItem>*/}

                        <BoxItem>
                            <StatusCountCard
                                onlineCount={
                                    serverList?.filter((v) => {
                                        return v.state === "ok"
                                    }).length || 0
                                }
                                offlineCount={
                                    serverList?.filter((v) => {
                                        return v.state !== "ok"
                                    }).length || 0
                                }
                                label={"api-server"}
                                icon={<ServersIcon/>}
                            />
                        </BoxItem>
                        <BoxItem>
                            <StatusCountCard
                                offlineCount={
                                    storeNodeServer?.filter((v) => {
                                        return v.state !== "ok"
                                    }).length || 0
                                }
                                onlineCount={
                                    storeNodeServer?.filter((v) => {
                                        return v.state === "ok"
                                    }).length || 0
                                }
                                label={"store-server"}
                                icon={<DrivesIcon/>}
                            />
                        </BoxItem>

                        {/*<Box*/}
                        {/*    withBorders*/}
                        {/*    sx={{*/}
                        {/*        gridRowStart: "1",*/}
                        {/*        gridRowEnd: "3",*/}
                        {/*        gridColumnStart: "3",*/}
                        {/*        padding: 15,*/}
                        {/*        display: "grid",*/}
                        {/*        justifyContent: "stretch",*/}
                        {/*    }}*/}
                        {/*>*/}

                        <Box
                            sx={{
                                display: "flex",
                                flexFlow: "column",
                                gap: "14px",
                            }}
                        >
                            {/*<TimeStatItem*/}
                            {/*    icon={<HealIcon/>}*/}
                            {/*    label={*/}
                            {/*        <Box>*/}
                            {/*            <Box*/}
                            {/*                sx={{*/}
                            {/*                    display: "inline",*/}
                            {/*                    [`@media (max-width: ${breakPoints.sm}px)`]: {*/}
                            {/*                        display: "none",*/}
                            {/*                    },*/}
                            {/*                }}*/}
                            {/*            >*/}
                            {/*                Time since last*/}
                            {/*            </Box>{" "}*/}
                            {/*            Heal Activity*/}
                            {/*        </Box>*/}
                            {/*    }*/}
                            {/*    value={lastHeal}*/}
                            {/*/>*/}
                            {/*<TimeStatItem*/}
                            {/*    icon={<DiagnosticsMenuIcon/>}*/}
                            {/*    label={*/}
                            {/*        <Box>*/}
                            {/*            <Box*/}
                            {/*                sx={{*/}
                            {/*                    display: "inline",*/}
                            {/*                    [`@media (max-width: ${breakPoints.sm}px)`]: {*/}
                            {/*                        display: "none",*/}
                            {/*                    },*/}
                            {/*                }}*/}
                            {/*            >*/}
                            {/*                Time since last*/}
                            {/*            </Box>{" "}*/}
                            {/*            Scan Activity*/}
                            {/*        </Box>*/}
                            {/*    }*/}
                            {/*    value={lastScan}*/}
                            {/*/>*/}
                            {/*<TimeStatItem*/}
                            {/*    icon={<UptimeIcon/>}*/}
                            {/*    label={"Uptime"}*/}
                            {/*    value={upTime}*/}
                            {/*/>*/}
                            {/*</Box>*/}
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "14px",
                            [`@media (max-width: ${breakPoints.lg}px)`]: {
                                gridTemplateColumns: "1fr",
                            },
                        }}
                    >
                        {/*<TimeStatItem*/}
                        {/*    icon={<StorageIcon/>}*/}
                        {/*    label={"Backend type"}*/}
                        {/*    value={usage?.backend?.backendType ?? "Unknown"}*/}
                        {/*/>*/}
                        {/*<TimeStatItem*/}
                        {/*    icon={<FormatDrivesIcon/>}*/}
                        {/*    label={"Standard storage class parity"}*/}
                        {/*    value={usage?.backend?.standardSCParity?.toString() ?? "n/a"}*/}
                        {/*/>*/}
                        {/*<TimeStatItem*/}
                        {/*    icon={<FormatDrivesIcon/>}*/}
                        {/*    label={"Reduced redundancy storage class parity"}*/}
                        {/*    value={usage?.backend?.rrSCParity?.toString() ?? "n/a"}*/}
                        {/*/>*/}
                    </Box>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateRows: "auto",
                            gridTemplateColumns: "1fr",
                            gap: "auto",
                        }}
                    >
                        <BaseServersList data={serverList}/>
                        <StoreServersList data={storeNodeServer || []}/>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default BasicDashboard;
