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

import { Box, DataTable, Grid, ProgressBar } from "mds";
import { stringSort } from "../../../utils/sortFunctions";
import { GroupsList } from "../Groups/types";
import { ErrorResponseHandler } from "../../../common/types";
import { setModalErrorSnackMessage } from "../../../systemSlice";
import { useAppDispatch } from "../../../store";
import SearchBox from "../Common/SearchBox";
import {api} from "../../../api";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import {Role} from "../../../api/consoleApi";

interface IGroupsProps {
  selectedRoleIds: string[];
  setSelectedGroups: any;
  shouldCreatedByMe: boolean;
}

const RolesSelectors = ({
  selectedRoleIds,
  setSelectedGroups,
  shouldCreatedByMe,
}: IGroupsProps) => {
  const dispatch = useAppDispatch();
  // Local State
  const [records, setRecords] = useState<Role[]>([]);
  const [loading, isLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");

  const fetchGroups = useCallback(() => {
    let filter = {};
    if (shouldCreatedByMe) {
      filter = {createByMe: true}
    }
    api.role.getMyRoleDetail(filter).then(res => {
      setRecords(res.data)
      isLoading(false)
    }).catch(e => {
      dispatch(setModalErrorSnackMessage(e))
      isLoading(false)
    })
  }, [dispatch]);

  //Effects
  useEffect(() => {
    isLoading(true);
  }, []);

  useEffect(() => {
    if (loading) {
      fetchGroups();
    }
  }, [loading, fetchGroups]);

  const selGroups = !selectedRoleIds ? [] : selectedRoleIds;

  const selectionChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetD = e.target;
    const value = targetD.value;
    const checked = targetD.checked;

    let elements: string[] = [...selGroups]; // We clone the selectedGroups array

    if (checked) {
      // If the user has checked this field we need to push this to selectedGroupsList
      elements.push(value);
    } else {
      // User has unchecked this field, we need to remove it from the list
      elements = elements.filter((element) => element !== value);
    }
    console.log(elements)
    setSelectedGroups(elements);
    return elements;
  };

  const filteredRecords = records;

  return (
    <Grid item xs={12} className={"inputItem"}>
      {loading && <ProgressBar />}
      {records !== null && records.length > 0 ? (
        <Fragment>
          <DataTable
            columns={[{ label: "角色" , elementKey: "name"}]}
            onSelect={selectionChanged}
            selectedItems={selGroups}
            isLoading={loading}
            records={filteredRecords}
            entityName="Groups"
            idField="id"
            customPaperHeight={"200px"}
          />
        </Fragment>
      ) : (
        <></>
      )}
    </Grid>
  );
};

export default RolesSelectors;
