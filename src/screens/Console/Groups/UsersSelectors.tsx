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

import React, { useCallback, useEffect, useState, Fragment } from "react";
import get from "lodash/get";
import { api } from "api";
import { errorToHandler } from "api/errors";
import { Box, DataTable, Grid, ProgressBar } from "mds";

import { usersSort } from "../../../utils/sortFunctions";
import { setModalErrorSnackMessage } from "../../../systemSlice";
import { useAppDispatch } from "../../../store";
import SearchBox from "../Common/SearchBox";
import {Bucket} from "../../../api/consoleApi";

interface IGroupsProps {
  selectedUsers: string[];
  setSelectedUsers: any;
  editMode?: boolean;
  title?: string;
}

const UsersSelectors = ({
  selectedUsers,
  setSelectedUsers,
  editMode = false, title
}: IGroupsProps) => {
  const dispatch = useAppDispatch();
  //Local States
  const [records, setRecords] = useState<any[]>([]);
  const [loading, isLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");

  const fetchBuckets = useCallback(() => {
    api.buckets
      .listBuckets()
      .then((res) => {
        let buckets = get(res.data, "buckets", []);

        if (!buckets) {
          buckets = [];
        }

        setRecords(buckets);
        isLoading(false);
      })
      .catch((err) => {
        dispatch(setModalErrorSnackMessage(errorToHandler(err.error)));
        isLoading(false);
      });
  }, [dispatch]);

  //Effects
  useEffect(() => {
    isLoading(true);
  }, []);

  useEffect(() => {
    if (loading) {
      fetchBuckets();
    }
  }, [loading, fetchBuckets]);

  const selUsers = !selectedUsers ? [] : selectedUsers;

  //Fetch Actions
  const selectionChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetD = e.target;
    const value = targetD.value;
    const checked = targetD.checked;

    let elements: string[] = [...selUsers]; // We clone the selectedGroups array

    if (checked) {
      // If the user has checked this field we need to push this to selectedGroupsList
      elements.push(value);
    } else {
      // User has unchecked this field, we need to remove it from the list
      elements = elements.filter((element) => element !== value);
    }
    setSelectedUsers(elements);

    return elements;
  };

  const filteredRecords = records.filter((elementItem: Bucket) =>
    elementItem.name.includes(filter),
  );

  return (
    <Grid item xs={12} className={"inputItem"}>
      <Box>
        {loading && <ProgressBar />}
        {records?.length > 0 ? (
          <Fragment>
            <DataTable
              columns={[{ label: `${title}`, elementKey: "name" }]}
              onSelect={selectionChanged}
              selectedItems={selUsers}
              isLoading={loading}
              records={filteredRecords}
              entityName="Buckets"
              idField="name"
              customPaperHeight={"200px"}
            />
          </Fragment>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              padding: "10px 0",
            }}
          >
            No Bucket to display
          </Box>
        )}
      </Box>
    </Grid>
  );
};

export default UsersSelectors;
