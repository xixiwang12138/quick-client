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

import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { DataTable, SectionTitle, Tabs, HelpTip } from "mds";
import { api } from "api";
import { errorToHandler } from "api/errors";
import {
  CONSOLE_UI_RESOURCE,
  IAM_PAGES,
  IAM_SCOPES,
} from "../../../../common/SecureComponent/permissions";
import {
  hasPermission,
  SecureComponent,
} from "../../../../common/SecureComponent";
import { encodeURLString } from "../../../../common/utils";
import { setErrorSnackMessage, setHelpName } from "../../../../systemSlice";
import { selBucketDetailsLoading } from "./bucketDetailsSlice";
import { useAppDispatch } from "../../../../store";
import {Policy, QuickIOUser, User} from "../../../../api/consoleApi";

const AccessDetails = () => {
  const dispatch = useAppDispatch();
  const params = useParams();

  const loadingBucket = useSelector(selBucketDetailsLoading);

  const [curTab, setCurTab] = useState<string>("simple-tab-0");
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [bucketUsers, setBucketUsers] = useState<QuickIOUser[]>([]);

  const bucketName = params.bucketName || "";
  const displayUsersList = hasPermission(
    bucketName,
    [
      IAM_SCOPES.ADMIN_GET_POLICY,
      IAM_SCOPES.ADMIN_LIST_USERS,
      IAM_SCOPES.ADMIN_LIST_GROUPS,
    ],
    true,
  );

  const viewUser = hasPermission(CONSOLE_UI_RESOURCE, [
    IAM_SCOPES.ADMIN_GET_USER,
  ]);
  useEffect(() => {
    if (loadingBucket) {
      setLoadingUsers(true);
    }
  }, [loadingBucket, setLoadingUsers]);

  const userTableActions = [
    {
      type: "view",
      disableButtonFunction: () => !viewUser,
      onClick: (user: any) => {},
    },
  ];

  useEffect(() => {
    if (loadingUsers) {
      if (displayUsersList) {
        api.bucketUsers
          .listUsersWithAccessToBucket(bucketName, {
            limit: 1000,
            offset: new Date().getTime(),
          })
          .then((res) => {
            setBucketUsers(res.data);
            setLoadingUsers(false);
          })
          .catch((err) => {
            dispatch(setErrorSnackMessage(errorToHandler(err)));
            setLoadingUsers(false);
          });
      } else {
        setLoadingUsers(false);
      }
    }
  }, [loadingUsers, dispatch, bucketName, displayUsersList]);

  useEffect(() => {
    dispatch(setHelpName("bucket_detail_access"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <Tabs
        currentTabOrPath={curTab}
        onTabClick={(newValue: string) => {
          setCurTab(newValue);
        }}
        horizontal
        options={[
          {
            tabConfig: { label: "Users", id: "simple-tab-1" },
            content: (
                <DataTable
                    noBackground={true}
                    itemActions={userTableActions}
                    columns={[
                      {label: "用户名", elementKey: "username"},
                      {label: "邮箱", elementKey: "email"},
                      {label: "创建时间", elementKey: "create_time_display"},
                    ]}
                    isLoading={loadingUsers}
                    records={bucketUsers}
                    entityName="Users"
                    idField="username"
                />
            ),
          },
        ]}
      />
    </Fragment>
  );
};

export default AccessDetails;
