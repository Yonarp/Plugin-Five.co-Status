//@ts-nocheck
import React, { useEffect, useState } from "react";
import { Box, Card, CircularProgress, FiveInitialize } from "./FivePluginApi";
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

  // Ensure the dropdown always has a value
  useEffect(() => {
    if (accountKey === "" && accountList.length > 0) {
      setAccountKey(accountList[0].__ACT);
    }
  }, [accountList, accountKey]);

  // FIX Type
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
        const status = item.Status;
        statusCounts[status]++;
      });
    }
    return statusCounts;
  };

  const handleClick = (status: string) => {
    if (status === "All") {
      five.setVariable("Status", `"__ACT" eq '${accountKey}'`);
    } else {
      five.setVariable(
        "Status",
        ` "__ACT" eq '${accountKey}' and Status eq '${status}'`
      );
    }
    five.refreshDataViews();
  };

  useEffect(() => {
    if (status !== null) {
      return;
    }

    setLoading(true);
    const fetchData = () => {
      five.executeFunction(
        "getAccountIVR",
        null,
        null,
        null,
        null,
        (result) => {
          const data = JSON.parse(result.serverResponse.results).response.value;
          setLoading(false);
          const statusCounts = countStatuses(data);
          setStatus(statusCounts);
          setAccountKey(data[0].__ACT);
          five.setVariable("StatusIVRAccount", data[0].__ACT);
        }
      );

      five.executeFunction("getUserAUJ", null, null, null, null, (result) => {
        const data = JSON.parse(result.serverResponse.results).response.value;
        setAccountList(data);
      });
    };

    fetchData();
  }, []);

  useEffect(() => {
    const actObj = {
      ACT: accountKey,
    };

    five.setVariable("StatusIVRAccount", accountKey);
    const fetchData = async () => {
      five.executeFunction(
        "getAccountIVRDetails",
        actObj,
        null,
        null,
        null,
        (result) => {
          const data = JSON.parse(result.serverResponse.results).response.value;
          const statusCounts = countStatuses(data);
          setStatus(statusCounts);
        }
      );
    };

    fetchData();
    handleClick("All");
  }, [accountKey]);

  if (loading || !status) {
    return (
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

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
     @media (max-width: 630px) {
       display: none;
     }
     @media (max-width: 750px) {
      font-size:8.5px;
     }
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

  return (
    <>
      <style>{cardCss}</style>

      <div
        style={{
          position: "absolute",
          bottom: "65%",
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
          // ever-present selection
          value={accountList.find((a) => a.__ACT === accountKey) || null}
          // what the user is typing
          inputValue={inputValue}
          onInputChange={(_, newInput, reason) => {
            if (reason === "input") {
              setInputValue(newInput);
            }
          }}
          // only fire when they pick from the list
          onChange={(_, newOption, reason) => {
            if (reason === "selectOption" && newOption) {
              setAccountKey(newOption.__ACT);
              setInputValue(newOption.OfficeName);
            }
          }}
          clearOnBlur={false} // don’t reset on blur
          disableClearable // removes the “×” clear button
          renderInput={(params) => (
            <TextField {...params} label="Account" variant="outlined" />
          )}
        />
        
      </div>

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
        <Item>
          <Card
            className="MuiCard-root"
            style={{ ...cardStyle, backgroundColor: "#15706A" }}
            onClick={() => handleClick("Approved")}
          >
            <Check style={{ fill: "white", color: "white" }} />
            <Typography
              className="statusText"
              noWrap
              style={{ fontSize: "12px", fontWeight: "bolder" }}
            >
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
            <HourglassBottom style={{ fill: "white", color: "white" }} />
            <Typography
              className="statusText"
              noWrap
              style={{ fontSize: "12px", fontWeight: "bolder" }}
            >
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
            <Cancel />
            <Typography
              className="statusText"
              noWrap
              style={{ fontSize: "12px", fontWeight: "bolder" }}
            >
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
            <Lock />
            <Typography
              className="statusText"
              noWrap
              style={{ fontSize: "12px", fontWeight: "bolder" }}
            >
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
            <Alarm />
            <Typography
              className="statusText"
              noWrap
              style={{ fontSize: "12px", fontWeight: "bolder" }}
            >
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
            <HourglassBottom />
            <Typography
              noWrap
              className="statusText"
              style={{ fontSize: "12px", fontWeight: "bolder" }}
            >
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
            <Undo />
            <Typography
              noWrap
              className="statusText"
              style={{ fontSize: "12px", fontWeight: "bolder" }}
            >
              All
            </Typography>
          </Card>
        </Item>
      </Container>
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

/* MuiDataGrid-columnSeparator MuiDataGrid-columnSeparator--resizable MuiDataGrid-columnSeparator--sideRight 

  



*/
