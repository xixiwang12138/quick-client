// This file is part of MinIO Console Server
// Copyright (c) 2021 MinIO, Inc.
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

import React, {Fragment, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    AddIcon,
    Button,
    DeleteIcon,
    GroupsIcon,
    HelpBox,
    IAMPoliciesIcon,
    PageLayout,
    UsersIcon,
    DataTable,
    Grid,
    Box,
    ProgressBar,
    ActionLink,
} from "mds";

import {api} from "api";
import {stringSort} from "../../../utils/sortFunctions";
import {actionsTray} from "../Common/FormComponents/common/styleLibrary";
import {
    applyPolicyPermissions,
    CONSOLE_UI_RESOURCE,
    createGroupPermissions,
    deleteGroupPermissions,
    displayGroupsPermissions,
    getGroupPermissions,
    IAM_PAGES,
    permissionTooltipHelper,
} from "../../../common/SecureComponent/permissions";
import {
    hasPermission,
    SecureComponent,
} from "../../../common/SecureComponent";
import {errorToHandler} from "../../../api/errors";
import withSuspense from "../Common/Components/withSuspense";
import {encodeURLString} from "../../../common/utils";
import {setErrorSnackMessage, setHelpName} from "../../../systemSlice";
import {AppState, useAppDispatch} from "../../../store";
import TooltipWrapper from "../Common/TooltipWrapper/TooltipWrapper";
import PageHeaderWrapper from "../Common/PageHeaderWrapper/PageHeaderWrapper";
import HelpMenu from "../HelpMenu";
import SearchBox from "../Common/SearchBox";
import {useSelector} from "react-redux";
import {Role} from "../../../api/consoleApi";
import {DOC_HELPER} from "../Users/doc";

const DeleteGroup = withSuspense(React.lazy(() => import("./DeleteGroup")));
const SetPolicy = withSuspense(
    React.lazy(() => import("../Policies/SetPolicy")),
);

interface UserRoleRecord {
    name: string; //角色名称

    own: string; // 是否拥有

    readCount: string; // 可查看
    writeCount: string;
    manageCount: string;
}

const Groups = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [loading, isLoading] = useState<boolean>(false);
    const [filter, setFilter] = useState<string>("");
    const [records, setRecords] = useState<any[]>([]);
    const [checkedGroups, setCheckedGroups] = useState<string[]>([]);

    const [userRoles, setUserRoles] = useState<string[]>([]);
    const transRole = (records: Role[]) => {
        return records.map(v => {
            return {
                name: v.name,
                own: !v ? "否" : (userRoles.includes(v.id as string) ? "是" : "否"),
                readCount: `${v.read_access.length}`,
                writeCount: `${v.write_access.length}`,
                manageCount: `${v.manage_access.length}`
            }
        })
    }

    useEffect(() => {
        const fetchUSerRole = () => {
            api.role.getMyRoles().then(res => {
                setUserRoles(res.data)
            }).catch(e => {
                console.log(e)
            })
        }

        fetchUSerRole()
    }, [])

    useEffect(() => {
        isLoading(true);
    }, []);

    useEffect(() => {
        isLoading(true);
    }, []);

    useEffect(() => {
        dispatch(setHelpName("groups"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const displayGroups = hasPermission(
        CONSOLE_UI_RESOURCE,
        displayGroupsPermissions,
    );

    const deleteGroup = hasPermission(
        CONSOLE_UI_RESOURCE,
        deleteGroupPermissions,
    );

    const getGroup = hasPermission(CONSOLE_UI_RESOURCE, getGroupPermissions);

    const applyPolicy = hasPermission(
        CONSOLE_UI_RESOURCE,
        applyPolicyPermissions,
        true,
    );

    const selectionChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {target: {value = "", checked = false} = {}} = e;

        let elements: string[] = [...checkedGroups]; // We clone the checkedUsers array

        if (checked) {
            // If the user has checked this field we need to push this to checkedUsersList
            elements.push(value);
        } else {
            // User has unchecked this field, we need to remove it from the list
            elements = elements.filter((element) => element !== value);
        }

        setCheckedGroups(elements);

        return elements;
    };

    useEffect(() => {
        if (loading) {
            if (displayGroups) {
                const fetchRecords = () => {
                    api.role
                        .listRoles(new Date().getTime(), 1000)
                        .then((res) => {
                            setRecords(res.data.roles || [])
                            isLoading(false);
                        })
                        .catch((err) => {
                            dispatch(setErrorSnackMessage(errorToHandler(err.error)));
                            isLoading(false);
                        });
                };
                fetchRecords();
            } else {
                isLoading(false);
            }
        }
    }, [loading, dispatch, displayGroups]);
    const filteredRecords = transRole(records);

    const viewAction = (group: any) => {
        navigate(`${IAM_PAGES.GROUPS}/${encodeURLString(group)}`);
    };

    const tableActions = [
        {
            type: "view",
            onClick: viewAction,
            disableButtonFunction: false,
        },
        {
            type: "preview",
            onClick: () => {
            },
        }
    ];

    return (
        <Fragment>
            <PageHeaderWrapper label={"Roles"} actions={<HelpMenu/>}/>

            <PageLayout>
                <Grid container>
                    <Grid item xs={12} sx={actionsTray.actionsTray}>
                        <SearchBox
                            placeholder={"Search Role"}
                            onChange={setFilter}
                            value={filter}
                            sx={{
                                marginRight: "auto",
                                maxWidth: 380,
                            }}
                        />

                        <Button
                            id={"create-role"}
                            label={"Create Role"}
                            variant="callAction"
                            icon={<AddIcon/>}
                            onClick={() => {
                                navigate(`${IAM_PAGES.GROUPS_ADD}`);
                            }}
                        />

                    </Grid>
                    {loading && <ProgressBar/>}
                    {!loading && (
                        <Fragment>
                            {records.length > 0 && (
                                <Fragment>
                                    <Grid item xs={12} sx={{marginBottom: 15}}>
                                        <SecureComponent
                                            resource={CONSOLE_UI_RESOURCE}
                                            scopes={displayGroupsPermissions}
                                            errorProps={{disabled: true}}
                                        >
                                            <DataTable
                                                itemActions={tableActions}
                                                columns={[
                                                    {label: "角色名称", elementKey: "name"},
                                                    {label: "可读资源数量", elementKey: "readCount"},
                                                    {label: "可写资源数量", elementKey: "writeCount"},
                                                    {label: "可管理资源数量", elementKey: "manageCount"},
                                                    {label: "是否已拥有", elementKey: "own"},
                                                ]}
                                                isLoading={loading}
                                                selectedItems={checkedGroups}
                                                // onSelect={
                                                //     deleteGroup || getGroup ? selectionChanged : undefined
                                                // }
                                                records={filteredRecords}
                                                entityName="Groups"
                                                idField=""
                                            />
                                        </SecureComponent>
                                    </Grid>
                                </Fragment>
                            )}
                        </Fragment>
                    )}
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item xs={8}>
                                <HelpBox
                                    title={"角色"}
                                    iconComponent={<UsersIcon/>}
                                    help={
                                        <Fragment>
                                            {DOC_HELPER.ROLE_BASIC}
                                            <br/>
                                            <br/>
                                            去创建用户，{" "}
                                            <ActionLink
                                                onClick={() => {
                                                    navigate(`${IAM_PAGES.GROUPS_ADD}`);
                                                }}
                                            >
                                                Create a Role
                                            </ActionLink>
                                            .
                                        </Fragment>
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </PageLayout>
        </Fragment>
    );
};

export default Groups;
