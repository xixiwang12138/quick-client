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
import {Accordion, Box, breakPoints} from "mds";
import BaseServerInfoItem from "./ServerInfoItem";
import DriveInfoItem from "./DriveInfoItem";
import {StoreNodeServer} from "./data";

const StoreServersList = ({data}: { data: StoreNodeServer[] }) => {
    const [expanded, setExpanded] = React.useState<string>(
        data.length > 1 ? "" : data[0].endpoint + "-0",
    );

    const handleClick = (key: string) => {
        setExpanded(key);
    };

    return (
        <Box>
            <Box
                sx={{
                    fontSize: 18,
                    lineHeight: 2,
                    fontWeight: 700,
                }}
            >
                store-servers({data.length})
            </Box>
            <Box>
                {data.map((serverInfo, index) => {
                    const key = `${serverInfo.endpoint}-${index}`;
                    const isExpanded = expanded === key;
                    return (
                        <Accordion
                            key={key}
                            expanded={isExpanded}
                            onTitleClick={() => {
                                if (!isExpanded) {
                                    handleClick(key);
                                } else {
                                    handleClick("");
                                }
                            }}
                            id={"key"}
                            title={<BaseServerInfoItem server={{
                                state: serverInfo.state,
                                endpoint: serverInfo.endpoint,
                            }}/>}
                            sx={{marginBottom: 15}}
                        >
                            <Box
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: "15px 30px",
                                    gap: 15,
                                    [`@media (max-width: ${breakPoints.sm}px)`]: {
                                        padding: "10px 10px",
                                    },
                                }}
                            >
                                <DriveInfoItem
                                    drive={serverInfo}
                                    key={`${serverInfo.endpoint}-${index}`}
                                />
                            </Box>
                        </Accordion>
                    );
                })}
            </Box>
        </Box>
    );
};

export default StoreServersList;
