// @ts-nocheck
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
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<StatusCounts | null>(null);
  const [accountKey, setAccountKey] = useState<string | undefined>(undefined);
  const [accountList, setAccountList] = useState([]);
  const [inputValue, setInputValue] = useState<string>("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [records, setRecords] = useState([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string>("");

  useEffect(() => {
    const ivrPageSize = five.getVariable("IVRPageSize")
    if(ivrPageSize <= 10) {
      setPageSize(10);
    }
    else {
      setPageSize(ivrPageSize);
    }
    setPage(1);
    five.executeFunction("getUserAUJ", null, null, null, null, (result) => {
      const accounts = JSON.parse(result.serverResponse.results).response.value;
      accounts.sort((a, b) => (a.OfficeName || "").localeCompare(b.OfficeName || ""));
      setAccountList(accounts);
    });
  }, []);

  useEffect(() => {
    if (accountList.length === 0) return;
    const savedAccount = five.variable?.StatusIVRAccount;
    const matched = accountList.find((a) => a.__ACT === savedAccount);
    const selected = matched || accountList[0];
    if (selected) {
      setAccountKey(selected.__ACT);
      setInputValue(selected.OfficeName);
      five.setVariable("StatusIVRAccount", selected.__ACT);
      fetchData(selected.__ACT, 1, pageSize);
      setPage(1);
    }
  }, [accountList]);

  useEffect(() => {
    if (!accountKey || !accountList.find(a => a.__ACT === accountKey)) return;
    five.setVariable("IVRPageSize", pageSize)
    fetchData(accountKey, page, pageSize);
  }, [accountKey, page, pageSize]);

  const fetchData = (act: string, pageNum: number, size: number) => {
    const skip = (pageNum - 1) * size;
    const top = size;
    const filterExpr = `__ACT eq '${act}'`;
    const statusVar = `${filterExpr}${statusText}&$top=${top}&$skip=${skip}`;
    console.log("Showing statusText with this", statusVar, statusText)
    setLoading(true);
    five.setVariable("Status", statusVar);
    five.setVariable("StatusIVRAccount", act);
    five.refreshDataViews();

    five.executeFunction(
      "getAccountIVRDetails",
      { ACT: act, top, skip },
      null,
      null,
      null,
      (result) => {
        const res = JSON.parse(result.serverResponse.results).response;
        const data = res.value;
        setStatus(countStatuses(data));
        setRecords(data);
        if (data.length > 0 && data[0].zCount != null) {
          setTotalCount(data[0].zCount);
        }
        setLoading(false);
      }
    );
  };

  const countStatuses = (data: any) => {
    const counts = {
      Approved: 0,
      Submitted: 0,
      Denied: 0,
      Archived: 0,
      Contingent: 0,
      Unsubmitted: 0,
    };
    data.forEach((item: any) => {
      if (counts[item.Status] !== undefined) counts[item.Status]++;
    });
    return counts;
  };

  const handleClick = (st: string) => {
    setPage(1);
    const filterExpr =
      st === "All"
        ? `__ACT eq '${accountKey}'`
        : `__ACT eq '${accountKey}' and Status eq '${st}'`;
      st === "All" ? setStatusText("") : setStatusText(` and Status eq '${st}'`)
    const statusVar = `${filterExpr}&$top=${pageSize}&$skip=0`;
    five.setVariable("Status", statusVar);
    five.setVariable("StatusIVRAccount", accountKey);
    five.refreshDataViews();
  };

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
  }
  `;

  if (loading || !status) {
    return (
      <Container style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <style>{cardCss}</style>

      <div style={{ position: "absolute", bottom: "50%", left: "-27%", backgroundColor: "white", width: "250px", zIndex: 999 }}>
        <Autocomplete
          size="small"
          fullWidth
          options={accountList}
          getOptionLabel={(opt) => (opt?.OfficeName ? String(opt.OfficeName) : "")}
          value={accountList.find((a) => a.__ACT === accountKey) || null}
          inputValue={inputValue}
          onInputChange={(_, newInput, reason) => {
            if (reason === "input") setInputValue(newInput);
          }}
          onChange={(_, newOption, reason) => {
            if (reason === "selectOption" && newOption) {
              setAccountKey(newOption.__ACT);
              setInputValue(newOption.OfficeName);
              five.setVariable("StatusIVRAccount", newOption.__ACT);
              setPage(1);
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

      <Container style={{ padding: 0, margin: 0, marginTop: 5, width: "100%", display: "flex", flexWrap: "nowrap", overflowX: "auto", justifyContent: "center" }}>
        {[
          { label: "Approved", color: "#15706A", icon: <Check /> },
          { label: "Submitted", color: "#F9AD3C", icon: <HourglassBottom /> },
          { label: "Denied", color: "#DC3545", icon: <Cancel /> },
          { label: "Archived", color: "#343A40", icon: <Lock /> },
          { label: "Contingent", color: "#5BC0DE", icon: <Alarm /> },
          { label: "Unsubmitted", color: "#6C757D", icon: <HourglassBottom /> },
          { label: "All", color: "#0F0F0F", icon: <Undo /> },
        ].map(({ label, color, icon }) => (
          <Item key={label}>
            <Card className="MuiCard-root" style={{ ...cardStyle, backgroundColor: color }} onClick={() => handleClick(label)}>
              {React.cloneElement(icon, { style: { fill: "white" } })}
              <Typography className="statusText" noWrap style={{ fontSize: 12, fontWeight: "bolder" }}>
                {label} {label !== "All" ? `(${status[label]})` : ""}
              </Typography>
            </Card>
          </Item>
        ))}
      </Container>

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