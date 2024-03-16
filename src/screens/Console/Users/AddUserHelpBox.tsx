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

import {
    Box,
    ChangeAccessPolicyIcon,
    GroupsIcon,
    HelpIconFilled, IAMPoliciesIcon,
    UsersIcon,
} from "mds";
import {DOC_HELPER} from "./doc";

const FeatureItem = ({
                         icon,
                         description,
                     }: {
    icon: any;
    description: string;
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                "& .min-icon": {
                    marginRight: "10px",
                    height: "23px",
                    width: "23px",
                    marginBottom: "10px",
                },
            }}
        >
            {icon}{" "}
            <div style={{fontSize: "14px", fontStyle: "italic", color: "#5E5E5E"}}>
                {description}
            </div>
        </Box>
    );
};
const AddUserHelpBox = () => {
    return (
        <Box
            sx={{
                flex: 1,
                border: "1px solid #eaeaea",
                borderRadius: "2px",
                display: "flex",
                flexFlow: "column",
                padding: "20px",
                marginTop: 0,
            }}
        >
            <Box
                sx={{
                    fontSize: "16px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "16px",

                    "& .min-icon": {
                        height: "21px",
                        width: "21px",
                        marginRight: "15px",
                    },
                }}
            >
                <HelpIconFilled/>
            </Box>
            <Box sx={{fontSize: "14px", marginBottom: "15px"}}>
                {DOC_HELPER.USER_BASIC}
                <br/>
                <br/>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    flexFlow: "column",
                }}
            >
                <FeatureItem icon={<UsersIcon/>} description={`创建用户`}/>
                <FeatureItem icon={<GroupsIcon/>} description={`管理角色`}/>
                <FeatureItem icon={<IAMPoliciesIcon/>} description={`授予角色`}/>
            </Box>
        </Box>
    );
};

export default AddUserHelpBox;
