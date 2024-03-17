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

import React, {ChangeEvent, Fragment, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {modalStyleUtils} from "../Common/FormComponents/common/styleLibrary";

import {
    BackLink, Box,
    Button,
    CreateGroupIcon, DataTable,
    FormLayout,
    Grid,
    InputBox,
    PageLayout,
    ProgressBar, ReadBox, Switch,
} from "mds";
import {api} from "api";
import {errorToHandler} from "api/errors";
import {IAM_PAGES} from "../../../common/SecureComponent/permissions";
import {setErrorSnackMessage, setHelpName, setUserPerm} from "../../../systemSlice";
import {AppState, useAppDispatch} from "../../../store";
import AddGroupHelpBox from "./AddGroupHelpBox";
import UsersSelectors from "./UsersSelectors";
import PageHeaderWrapper from "../Common/PageHeaderWrapper/PageHeaderWrapper";
import HelpMenu from "../HelpMenu";
import {setQuota} from "../Buckets/ListBuckets/AddBucket/addBucketsSlice";
import {Permission} from "../../../api/consoleApi";
import {useSelector} from "react-redux";
import {analyze} from "ts-prune/lib/analyzer";
import {set} from "lodash";


const SelectRecord = (props: any) => {
    return <FormLayout withBorders={false} containerPadding={false}>
        <Grid item xs={12} className={"inputItem"}>
            <Box>
                {props.display?.length > 0 ? (
                    <Fragment>
                        <DataTable
                            columns={[{label: `${props.title}`}]}
                            onSelect={props.select}
                            selectedItems={props.selectedRecords}
                            isLoading={false}
                            records={props.display}
                            customPaperHeight={"200px"}
                        />
                    </Fragment>
                ) : (
                    <></>
                )}
            </Box>
        </Grid>
    </FormLayout>;
}


const AddGroupScreen = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState<string>("");
    const [saving, isSaving] = useState<boolean>(false);
    const [loadUserPerm, setLoadUserPerm] = useState<boolean>(true);


    const [read, setRead] = useState<string[]>([]);
    const [write, setWrite] = useState<string[]>([]);
    const [manage, setManage] = useState<string[]>([]);


    const [validGroup, setValidGroup] = useState<boolean>(false);
    const [allowGrant, setAllowGrant] = useState<boolean>(false);
    const [allow_create_user, setAllowCreateUser] = useState<boolean>(false);

    const perm = useSelector(
        (state: AppState) => state.system.userPerm
    )

    const selectionReadChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {target: {value = "", checked = false} = {}} = e;

        let elements: string[] = [...read]; // We clone the checkedUsers array

        if (checked) {
            // If the user has checked this field we need to push this to checkedUsersList
            elements.push(value);
        } else {
            // User has unchecked this field, we need to remove it from the list
            elements = elements.filter((element) => element !== value);
        }

        setRead(elements);
        return read
    };
    const selectionWriteChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {target: {value = "", checked = false} = {}} = e;

        let elements: string[] = [...write]; // We clone the checkedUsers array

        if (checked) {
            // If the user has checked this field we need to push this to checkedUsersList
            elements.push(value);
        } else {
            // User has unchecked this field, we need to remove it from the list
            elements = elements.filter((element) => element !== value);
        }

        setWrite(elements);
        return write;
    };
    const selectionManageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {target: {value = "", checked = false} = {}} = e;

        let elements: string[] = [...manage]; // We clone the checkedUsers array

        if (checked) {
            // If the user has checked this field we need to push this to checkedUsersList
            elements.push(value);
        } else {
            // User has unchecked this field, we need to remove it from the list
            elements = elements.filter((element) => element !== value);
        }

        setManage(elements);
        return manage;
    };

    useEffect(() => {
        // 获取用户权限
        if (loadUserPerm) {
            const loadPerm = () => {
                api.user.getUserPerm({}).then((res) => {
                    dispatch(setUserPerm(res.data))
                    setLoadUserPerm(false)
                })
            }
            setLoadUserPerm(true)
            loadPerm()
        }

    }, [loadUserPerm])

    useEffect(() => {
        setValidGroup(groupName.trim() !== "");
    }, [groupName, read]);

    useEffect(() => {
        if (saving) {
            const saveRecord = () => {
                api.role.createRole({
                    name: groupName,
                    read_access: read.map((v) => {
                        return {
                            resource_type: "bucket",
                            resource_index: v,
                        }
                    }),
                    write_access: write.map((v) => {
                        return {
                            resource_type: "bucket",
                            resource_index: v,
                        }
                    }),
                    manage_access: manage.map((v) => {
                        return {
                            resource_type: "bucket",
                            resource_index: v,
                        }
                    }),
                    allow_create_user: allow_create_user,
                }).then((res) => {
                    isSaving(false);
                    navigate(`${IAM_PAGES.GROUPS}`);
                }).catch((err) => {
                    isSaving(false);
                    dispatch(setErrorSnackMessage(errorToHandler(err.error)));
                });
            };

            saveRecord();
        }
    }, [saving, groupName, read, dispatch, navigate]);

    //Fetch Actions
    const setSaving = (event: React.FormEvent) => {
        event.preventDefault();
        isSaving(true);
    };

    const resetForm = () => {
        setGroupName("");
        setRead([]);
        setWrite([])
        setAllowCreateUser(false);
        setAllowGrant(false)
    };

    useEffect(() => {
        dispatch(setHelpName("add_group"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <Fragment>
            <PageHeaderWrapper
                label={
                    <BackLink
                        label={"Roles"}
                        onClick={() => navigate(IAM_PAGES.GROUPS)}
                    />
                }
                actions={<HelpMenu/>}
            />
            <PageLayout>
                <FormLayout
                    title={"Create Role"}
                    icon={<CreateGroupIcon/>}
                    helpBox={<AddGroupHelpBox/>}
                >
                    <form noValidate autoComplete="off" onSubmit={setSaving}>
                        <InputBox
                            id="group-name"
                            name="group-name"
                            label="角色名称"
                            autoFocus={true}
                            value={groupName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setGroupName(e.target.value);
                            }}
                        />
                        {perm?.readable && (<FormLayout withBorders={false} containerPadding={false}>
                            <Grid item xs={12} className={"inputItem"}>
                                <Box>
                                    {(perm?.readable.map(value => value.resource_index) as []).length > 0 ? (
                                        <Fragment>
                                            <DataTable
                                                columns={[{label: `授予仅读权限的bucket`}]}
                                                onSelect={selectionReadChanged}
                                                selectedItems={read}
                                                isLoading={false}
                                                records={(perm?.readable.map(value => value.resource_index) as [])}
                                                customPaperHeight={"200px"}
                                            />
                                        </Fragment>
                                    ) : (
                                        <></>
                                    )}
                                </Box>
                            </Grid>
                        </FormLayout>)}

                        {perm?.writable && (<FormLayout withBorders={false} containerPadding={false}>
                            <Grid item xs={12} className={"inputItem"}>
                                <Box>
                                    {(perm?.writable.map(value => value.resource_index) as []).length > 0 ? (
                                        <Fragment>
                                            <DataTable
                                                columns={[{label: `授予读写权限的bucket`}]}
                                                onSelect={selectionWriteChanged}
                                                selectedItems={write}
                                                isLoading={false}
                                                records={(perm?.writable.map(value => value.resource_index) as [])}
                                                customPaperHeight={"200px"}
                                            />
                                        </Fragment>
                                    ) : (
                                        <></>
                                    )}
                                </Box>
                            </Grid>
                        </FormLayout>)}

                        {perm?.manageable && (<FormLayout withBorders={false} containerPadding={false}>
                            <Grid item xs={12} className={"inputItem"}>
                                <Box>
                                    {(perm?.manageable.map(value => value.resource_index) as []).length > 0 ? (
                                        <Fragment>
                                            <DataTable
                                                columns={[{label: `授予管理权限的bucket`}]}
                                                onSelect={selectionManageChanged}
                                                selectedItems={manage}
                                                isLoading={false}
                                                records={(perm?.manageable.map(value => value.resource_index) as [])}
                                                customPaperHeight={"200px"}
                                            />
                                        </Fragment>
                                    ) : (
                                        <></>
                                    )}
                                </Box>
                            </Grid>
                        </FormLayout>)}

                        <Grid xs={12}>
                            {
                                perm?.create_user ?
                                    <Switch
                                        value="allow_create_user"
                                        id="allow_create_user"
                                        name="allow_create_user"
                                        checked={allow_create_user}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            setAllowCreateUser(event.target.checked)
                                        }}
                                        label={"允许该角色创建新的用户"}
                                        disabled={!perm?.create_user}
                                        helpTipPlacement="right"
                                    /> : <></>
                            }
                        </Grid>


                        <Grid item xs={12} sx={modalStyleUtils.modalButtonBar}>
                            <Button
                                id={"clear-group"}
                                type="button"
                                variant="regular"
                                onClick={resetForm}
                                label={"Clear"}
                            />

                            <Button
                                id={"save-group"}
                                type="submit"
                                variant="callAction"
                                disabled={saving || !validGroup}
                                label={"Save"}
                            />
                        </Grid>
                        {saving && (
                            <Grid item xs={12}>
                                <ProgressBar/>
                            </Grid>
                        )}
                        {loadUserPerm && (
                            <Grid item xs={12}>
                                <ProgressBar/>
                            </Grid>
                        )}
                    </form>
                </FormLayout>
            </PageLayout>
        </Fragment>
    );
};

export default AddGroupScreen;
