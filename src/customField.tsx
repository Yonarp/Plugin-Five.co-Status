//@ts-nocheck
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CircularProgress,
  FiveInitialize,
  Button,
} from "./FivePluginApi";
import { CustomFieldProps } from "../../../common";
import { Container, Typography } from "@mui/material";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  Alarm,
  Cancel,
  Check,
  HourglassBottom,
  Lock,
  Undo,
} from "@mui/icons-material";

FiveInitialize();

interface StatusCounts {
  Approved: number;
  Submitted: number;
  Denied: number;
  Archived: number;
  Contingent: number;
  Unsubmitted: number;
}

const CustomField = (props: CustomFieldProps) => {
  const { five } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusCounts>(null);
  const [accountKey, setAccountKey] = useState<string>("");
  //@ts-ignore
  const [accountList, setAccountList] = useState([]);
  const [inputValue, setInputValue] = useState<string>("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);            //  ▼▼ new
  const [records, setRecords] = useState([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  /* ───── Ensure the dropdown always has a value ───── */
  useEffect(() => {
    if (accountKey === "" && accountList.length > 0) {
      setAccountKey(accountList[0].__ACT);
    }
  }, [accountList, accountKey]);

  /* ───── Helpers ───── */
  const countStatuses = (data: any) => {
    const statusCounts = {
      Approved: 0,
      Submitted: 0,
      Denied: 0,
      Archived: 0,
      Contingent: 0,
      Unsubmitted: 0,
    };

    if (data.length > 0) {
      data.forEach((item: any) => {
        const st = item.Status;
        statusCounts[st]++;
      });
    }
    return statusCounts;
  };

  const handleClick = (st: string) => {
    setPage(1); // reset to first page

    const filterExpr =
      st === "All"
        ? `__ACT eq '${accountKey}'`
        : `__ACT eq '${accountKey}' and Status eq '${st}'`;

    const statusVar = `${filterExpr}&$top=${pageSize}&$skip=0`;
    five.setVariable("Status", statusVar);
    five.setVariable("StatusIVRAccount", accountKey);
    five.refreshDataViews();
  };

  /* ───── Initial load ───── */
  useEffect(() => {
    if (status !== null) return;

    setLoading(true);
    five.executeFunction(
      "getAccountIVR",
      null,
      null,
      null,
      null,
      (result) => {
        const data = JSON.parse(result.serverResponse.results).response.value;
        setLoading(false);
        setStatus(countStatuses(data));
        setAccountKey(data[0].__ACT);
        setInputValue(data[0].OfficeName);
        five.setVariable("StatusIVRAccount", data[0].__ACT);
      }
    );

    five.executeFunction("getUserAUJ", null, null, null, null, (result) => {
      const data = JSON.parse(result.serverResponse.results).response.value;
      data.sort((a, b) =>
        (a.OfficeName || "").localeCompare(b.OfficeName || "")
      );
      setAccountList(data);
    });
  }, []);

  /* ───── Reset page when account changes ───── */
  useEffect(() => {
    setPage(1);
  }, [accountKey]);

  /* ───── Load data when account / page / pageSize changes ───── */
  useEffect(() => {
    if (!accountKey) return;
    setLoading(true);

    const skip = (page - 1) * pageSize;
    const top = pageSize;
    const filterExpr = `__ACT eq '${accountKey}'`;
    const statusVar = `${filterExpr}&$top=${top}&$skip=${skip}`;

    five.setVariable("Status", statusVar);
    five.setVariable("StatusIVRAccount", accountKey);
    five.refreshDataViews();

    five.executeFunction(
      "getAccountIVRDetails",
      { ACT: accountKey, top, skip },
      null,
      null,
      null,
      (result) => {
        const res = JSON.parse(result.serverResponse.results).response;
        const data = res.value;
        setStatus(countStatuses(data));
        setRecords(data);
        if (res["@odata.count"] != null) {
          setTotalCount(res["@odata.count"]);
        }
        setLoading(false);
      }
    );
  }, [accountKey, page, pageSize]);             

  if (loading || !status) {
    return (
      <Container
        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  /* ───── Styles ───── */
  const cardStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px 10px",
    fontSize: "7px",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  };

  const cardCss = `
  .statusText {
    @media (max-width: 630px) { display: none; }
    @media (max-width: 750px) { font-size: 8.5px; }
  }
  .MuiCard-root {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .MuiCard-root:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  .MuiCard-root:focus {
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  .accountDropdown {
    position: absolute;
    top: 85px;
    left: -50px;
    z-index: 999;
    background-color: white;
    width: 200px;
  }
  #Five-Form-Field-Statises {
    background-color: transparent !important;
    box-shadow: none !important;
    border: none;
    outline: none;
  }`;

  /* ───── JSX ───── */
  return (
    <>
      <style>{cardCss}</style>

      {/* ──── Account & Page-size dropdowns ──── */}
      <div
        style={{
          position: "absolute",
          bottom: "50%",
          left: "-27%",
          backgroundColor: "white",
          width: "250px",
          zIndex: 999,
        }}
      >
        <Autocomplete
          size="small"
          fullWidth
          options={accountList}
          getOptionLabel={(opt) => opt.OfficeName || ""}
          value={accountList.find((a) => a.__ACT === accountKey) || null}
          inputValue={inputValue}
          onInputChange={(_, newInput, reason) => {
            if (reason === "input") setInputValue(newInput);
          }}
          onChange={(_, newOption, reason) => {
            if (reason === "selectOption" && newOption) {
              setAccountKey(newOption.__ACT);
              setInputValue(newOption.OfficeName);
            }
          }}
          clearOnBlur={false}
          disableClearable
          renderInput={(params) => (
            <TextField {...params} label="Account" variant="outlined" />
          )}
        />


        <FormControl size="small" fullWidth style={{ marginTop: 8 }}>
          <InputLabel id="pg-size-label">Page Size</InputLabel>
          <Select
            labelId="pg-size-label"
            value={pageSize}
            label="Page Size"
            onChange={(e) => {
              setPageSize(e.target.value as number);
              setPage(1);
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </div>

      {/* ──── Status cards container ──── */}
      <Container
        style={{
          padding: 0,
          margin: 0,
          marginTop: 5,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          overflowX: "auto",
          background: "transparent",
          border: "none",
          outline: "none",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        {/* Repeat for each status card */}
        <Item>
          <Card
            className="MuiCard-root"
            style={{ ...cardStyle, backgroundColor: "#15706A" }}
            onClick={() => handleClick("Approved")}
          >
            <Check style={{ fill: "white" }} />
            <Typography className="statusText" noWrap style={{ fontSize: 12, fontWeight: "bolder" }}>
              Approved ({status.Approved})
            </Typography>
          </Card>
        </Item>

        <Item>
          <Card
            className="MuiCard-root"
            style={{ ...cardStyle, backgroundColor: "#F9AD3C" }}
            onClick={() => handleClick("Submitted")}
          >
            <HourglassBottom style={{ fill: "white" }} />
            <Typography className="statusText" noWrap style={{ fontSize: 12, fontWeight: "bolder" }}>
              Submitted ({status.Submitted})
            </Typography>
          </Card>
        </Item>

        <Item>
          <Card
            className="MuiCard-root"
            style={{ ...cardStyle, backgroundColor: "#DC3545" }}
            onClick={() => handleClick("Denied")}
          >
            <Cancel style={{ fill: "white" }} />
            <Typography className="statusText" noWrap style={{ fontSize: 12, fontWeight: "bolder" }}>
              Denied ({status.Denied})
            </Typography>
          </Card>
        </Item>

        <Item>
          <Card
            className="MuiCard-root"
            style={{ ...cardStyle, backgroundColor: "#343A40" }}
            onClick={() => handleClick("Archived")}
          >
            <Lock style={{ fill: "white" }} />
            <Typography className="statusText" noWrap style={{ fontSize: 12, fontWeight: "bolder" }}>
              Archived ({status.Archived})
            </Typography>
          </Card>
        </Item>

        <Item>
          <Card
            className="MuiCard-root"
            style={{ ...cardStyle, backgroundColor: "#5BC0DE" }}
            onClick={() => handleClick("Contingent")}
          >
            <Alarm style={{ fill: "white" }} />
            <Typography className="statusText" noWrap style={{ fontSize: 12, fontWeight: "bolder" }}>
              Contingent ({status.Contingent})
            </Typography>
          </Card>
        </Item>

        <Item>
          <Card
            className="MuiCard-root"
            style={{ ...cardStyle, backgroundColor: "#6C757D" }}
            onClick={() => handleClick("Unsubmitted")}
          >
            <HourglassBottom style={{ fill: "white" }} />
            <Typography className="statusText" noWrap style={{ fontSize: 12, fontWeight: "bolder" }}>
              Unsubmitted ({status.Unsubmitted})
            </Typography>
          </Card>
        </Item>

        <Item>
          <Card
            className="MuiCard-root"
            style={{ ...cardStyle, backgroundColor: "#0F0F0F" }}
            onClick={() => handleClick("All")}
          >
            <Undo style={{ fill: "white" }} />
            <Typography className="statusText" noWrap style={{ fontSize: 12, fontWeight: "bolder" }}>
              All
            </Typography>
          </Card>
        </Item>
      </Container>

      {/* ──── Pagination controls ──── */}
      <div style={{ textAlign: "center", margin: "12px 0" }}>
        <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1 || loading}>
          Prev
        </button>

        <span style={{ margin: "0 8px" }}>
          Page {page}
          {totalCount != null && ` of ${Math.ceil(totalCount / pageSize)}`}
        </span>

        <button
          onClick={() =>
            setPage((p) =>
              totalCount ? Math.min(p + 1, Math.ceil(totalCount / pageSize)) : p + 1
            )
          }
          disabled={loading || (totalCount != null && page >= Math.ceil(totalCount / pageSize))}
        >
          Next
        </button>
      </div>
    </>
  );
};

function Item(props) {
  return (
    <Box
      sx={{
        p: 1,
        m: 1,
        flex: "1 1 auto",
        borderRadius: 2,
        fontSize: "0.875rem",
        fontWeight: "700",
        minWidth: 0,
      }}
      {...props}
    />
  );
}

export default CustomField;