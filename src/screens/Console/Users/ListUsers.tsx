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
    PageLayout,
    UsersIcon,
    DataTable,
    Grid,
    ProgressBar,
    ActionLink,
} from "mds";

import {User, UsersList} from "./types";
import {usersSort} from "../../../utils/sortFunctions";
import {actionsTray} from "../Common/FormComponents/common/styleLibrary";
import {ErrorResponseHandler} from "../../../common/types";
import {encodeURLString} from "../../../common/utils";
import {
    addUserToGroupPermissions,
    CONSOLE_UI_RESOURCE,
    deleteUserPermissions,
    IAM_PAGES,
    IAM_SCOPES,
    listUsersPermissions,
    permissionTooltipHelper,
    S3_ALL_RESOURCES,
    viewUserPermissions,
} from "../../../common/SecureComponent/permissions";
import SearchBox from "../Common/SearchBox";
import withSuspense from "../Common/Components/withSuspense";

import {
    hasPermission,
    SecureComponent,
} from "../../../common/SecureComponent";
import {setErrorSnackMessage, setHelpName, setUserPerm} from "../../../systemSlice";
import {AppState, useAppDispatch} from "../../../store";
import TooltipWrapper from "../Common/TooltipWrapper/TooltipWrapper";
import PageHeaderWrapper from "../Common/PageHeaderWrapper/PageHeaderWrapper";
import HelpMenu from "../HelpMenu";
import {api} from "../../../api";
import {QuickIOUser} from "../../../api/consoleApi";
import {useSelector} from "react-redux";

const DeleteUser = withSuspense(React.lazy(() => import("./DeleteUser")));
const AddToGroup = withSuspense(React.lazy(() => import("./BulkAddToGroup")));

const ListUsers = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const perm = useSelector((state: AppState) => state.system.userPerm)

    const [records, setRecords] = useState<QuickIOUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
    const [addGroupOpen, setAddGroupOpen] = useState<boolean>(false);
    const [filter, setFilter] = useState<string>("");
    const [checkedUsers, setCheckedUsers] = useState<string[]>([]);

    const displayListUsers = hasPermission(
        CONSOLE_UI_RESOURCE,
        listUsersPermissions,
    );

    const viewUser = hasPermission(CONSOLE_UI_RESOURCE, viewUserPermissions);

    const addUserToGroup = hasPermission(
        CONSOLE_UI_RESOURCE,
        addUserToGroupPermissions,
    );

    const deleteUser = hasPermission(CONSOLE_UI_RESOURCE, deleteUserPermissions);

    useEffect(() => {
        api.user.getUserPerm().then(res => {
            dispatch(setUserPerm(res.data))
        }).catch(e => console.log("[ListUsers] request user perm", e))
    }, [dispatch])

    const closeDeleteModalAndRefresh = (refresh: boolean) => {
        setDeleteOpen(false);
        if (refresh) {
            setLoading(true);
            setCheckedUsers([]);
        }
    };

    const closeAddGroupBulk = (unCheckAll: boolean = false) => {
        setAddGroupOpen(false);
        if (unCheckAll) {
            setCheckedUsers([]);
        }
    };

    useEffect(() => {
        if (loading) {
            if (displayListUsers) {
                api.users.listUsers({
                    offset: new Date().getTime(),
                    limit: 1000,
                }).then((res) => {
                    setRecords(res.data.users || []);
                    setLoading(false);
                }).catch((e) => {
                    console.log(e)
                    setLoading(false);
                })
            } else {
                setLoading(false);
            }
        }
    }, [loading, dispatch, displayListUsers]);

    const filteredRecords = records.map(record => {
        const createTime = new Date(record.create_time);
        const formattedTime = `${createTime.getFullYear()}-${(createTime.getMonth() + 1).toString().padStart(2, '0')}-${createTime.getDate().toString().padStart(2, '0')} ${createTime.getHours().toString().padStart(2, '0')}:${createTime.getMinutes().toString().padStart(2, '0')}:${createTime.getSeconds().toString().padStart(2, '0')}`;
        return {
            ...record,
            create_time_display: formattedTime
        };
    });

    const selectionChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {target: {value = "", checked = false} = {}} = e;

        let elements: string[] = [...checkedUsers]; // We clone the checkedUsers array

        if (checked) {
            // If the user has checked this field we need to push this to checkedUsersList
            elements.push(value);
        } else {
            // User has unchecked this field, we need to remove it from the list
            elements = elements.filter((element) => element !== value);
        }

        setCheckedUsers(elements);

        return elements;
    };

    const viewAction = (selectionElement: any): void => {
        navigate(
            `${IAM_PAGES.USERS}/${encodeURLString(selectionElement.accessKey)}`,
        );
    };

    const tableActions = [
        {
            type: "view",
            onClick: viewAction,
            disableButtonFunction: () => !viewUser,
        },
        {
            type: "edit",
            onClick: viewAction,
            disableButtonFunction: () => !viewUser,
        },
    ];

    useEffect(() => {
        dispatch(setHelpName("list_users"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Fragment>
            {deleteOpen && (
                <DeleteUser
                    deleteOpen={deleteOpen}
                    selectedUsers={checkedUsers}
                    closeDeleteModalAndRefresh={(refresh: boolean) => {
                        closeDeleteModalAndRefresh(refresh);
                    }}
                />
            )}
            {addGroupOpen && (
                <AddToGroup
                    open={addGroupOpen}
                    checkedUsers={checkedUsers}
                    closeModalAndRefresh={(close: boolean) => {
                        closeAddGroupBulk(close);
                    }}
                />
            )}
            <PageHeaderWrapper label={"Users"} actions={<HelpMenu/>}/>

            <PageLayout>
                <Grid container>
                    <Grid item xs={12} sx={actionsTray.actionsTray}>
                        <SearchBox
                            placeholder={"Search Users"}
                            onChange={setFilter}
                            value={filter}
                            sx={{
                                marginRight: "auto",
                                maxWidth: 380,
                            }}
                        />
                        <Button
                            id={"add-to-group"}
                            label={"Grant Role"}
                            icon={<GroupsIcon/>}
                            disabled={checkedUsers.length <= 0}
                            onClick={() => {
                                if (checkedUsers.length > 0) {
                                    setAddGroupOpen(true);
                                }
                            }}
                            variant={"regular"}
                        />
                        {(perm.create_user && <Button
                            id={"create-user"}
                            label={"Create User"}
                            icon={<AddIcon/>}
                            onClick={() => {
                                navigate(`${IAM_PAGES.USER_ADD}`);
                            }}
                            variant={"callAction"}
                            disabled={
                                !perm.create_user
                            }
                        />)}
                    </Grid>

                    {loading && <ProgressBar/>}
                    {!loading && (
                        <Fragment>
                            {records.length > 0 && (
                                <Fragment>
                                    <Grid item xs={12} sx={{marginBottom: 15}}>
                                        <SecureComponent
                                            scopes={[IAM_SCOPES.ADMIN_LIST_USERS]}
                                            resource={CONSOLE_UI_RESOURCE}
                                            errorProps={{disabled: true}}
                                        >
                                            <DataTable
                                                itemActions={tableActions}
                                                columns={[
                                                    {label: "用户名", elementKey: "username"},
                                                    {label: "邮箱", elementKey: "email"},
                                                    {label: "创建时间", elementKey: "create_time_display"},

                                                ]}
                                                onSelect={
                                                    addUserToGroup || deleteUser
                                                        ? selectionChanged
                                                        : undefined
                                                }
                                                selectedItems={checkedUsers}
                                                isLoading={loading}
                                                records={filteredRecords}
                                                entityName="Users"
                                                idField="username"
                                            />
                                        </SecureComponent>
                                    </Grid>
                                </Fragment>
                            )}
                            {records.length === 0 && (
                                <Grid container>
                                    <Grid item xs={8}>
                                        <HelpBox
                                            title={"用户"}
                                            iconComponent={<UsersIcon/>}
                                            help={
                                                <Fragment>
                                                    一个QuickIO用户由唯一的AccessKey（用户名）和相应的SecretKey（密码）组成。
                                                    客户端必须通过指定现有MinIO用户的有效访问密钥AccessKey（用户名）和相应的SecretKey（密码）来验证其身份。
                                                    <br/>
                                                    <br/>
                                                    QuickIO使用基于角色的概念对用户的权限进行管理。每个用户只能访问角色明确授予的资源和操作，系统默认拒绝对任何其他资源或操作的访问。
                                                    <br/>
                                                    {perm.create_user && (<>
                                                        去创建一个用户，{" "}
                                                        <ActionLink
                                                            onClick={() => {
                                                                navigate(`${IAM_PAGES.USER_ADD}`);
                                                            }}
                                                        >
                                                            Create a User
                                                        </ActionLink>
                                                    </>)
                                                    }
                                                </Fragment>
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            )}
                        </Fragment>
                    )}
                </Grid>
            </PageLayout>
        </Fragment>
    );
};

export default ListUsers;
