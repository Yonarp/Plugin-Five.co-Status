//@ts-nocheck
import React, { useEffect, useState } from "react";
import { Box, Card, CircularProgress, FiveInitialize, ThemeProvider } from "./FivePluginApi";
import { CustomFieldProps } from "../../../common";
import { Container, FormControl, Grid, Typography } from "@mui/material";
import { Alarm, Cancel, Check, HourglassBottom, Lock } from "@mui/icons-material";

FiveInitialize();



const CustomField = (props: CustomFieldProps) => {
  const { theme, value, onValueUpdated, variant, five } = props;
  const [ivr, setIVR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({});
  //const { theme } = props;

  const countStatuses = (data) => {
    const statusCounts = {};

    data.forEach((item) => {
      const status = item.Status;
      if (statusCounts[status]) {
        statusCounts[status]++;
      } else {
        statusCounts[status] = 1;
      }
    });

    return statusCounts;
  };

  function Item(props: BoxProps) {
    const { sx, ...other } = props;
    return (
      <Box
        sx={{
          p: 1,
          m: 1,
          borderRadius: 2,
          fontSize: '0.875rem',
          fontWeight: '700',
          width:"150px",
          gap:"100px",
          ...sx,
        }}
        {...other}
      />
    );
  }

  // handling clicks on each status 
  //OG url = https://pksolsfms.ottomatic.cloud/fmi/odata/v4/Legacy/IVR?$select=___IVR,Status,Patient,Account,DateText&$filter=Status%20ne%20'Archived'&$orderby=Status asc
  const handleClick = (status) => {
    
    console.log("Setting Variable now")
    five.setVariable("Status", `Status eq '${status}'`);
    five.refreshDataViews();
    
  }

  useEffect(() => {
    console.log("Use effect triggered for Status");
    if (ivr === null) {
      setLoading(true);
     
      const fetchData = async () => {
        await five.executeFunction(
          "getAccountIVR",
          null,
          null,
          null,
          null,
          (result) => {
            const data = JSON.parse(result.serverResponse.results).response.value;
            setIVR(data);
            setLoading(false);
            const statusCounts = countStatuses(data);
            console.log("Status --> ", data);
            setStatus(statusCounts);
          }
        );
      };
      fetchData();
    }
  }, []);

  console.log("IVR ==> ", ivr);
  console.log("Statuses ", status);

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
    // width: "100px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px 10px",
    fontSize: "10px",
    color: "white",
    borderRadius: "8px",
    // margin: "8px",
    cursor: "pointer",
  };

  const cardCss = `
  .statusText {
     /* media queries */
     @media (max-width: 630px) {
       display: none;
     }
     @media (max-width: 750px) {
      font-size:8.5px;
     }
  }`;

  return(
  <Container
      style={{
        maxWidth: "100vw",
        background: "white",
        border: "none",
        borderColor: "white",
        outline: "none",
        padding: "0",
        gap:1
        // margin: "0",
      }}
  >

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          p: 1,
          m: 1,
          bgcolor: 'background.paper',
          justifyContent: 'space-between',
          //maxWidth: "100vw",
          borderRadius: 1,
          
        }}
      >
        <Item sx={{ wdith:"100%" }}>
          <Card style={{ ...cardStyle, backgroundColor: "#8DAC6E" }} onClick={() => handleClick("Approved")}>
            <Check style={{ fill: "white", color: "white" }} />
            <Typography noWrap style={{fontSize: '10px'}}>Approved ({status.Approved})</Typography>
          </Card>
        </Item>
        <Item>
        <Card style={{ ...cardStyle, backgroundColor: "#FCBD09" }} onClick={() => handleClick("Pending")}>
                <HourglassBottom style={{ fill: "white", color: "white" }}/>
                <Typography noWrap style={{fontSize: '10px'}}>Pending ({status.Pending})</Typography>
        </Card>
        </Item>
        <Item>
        <Card style={{ ...cardStyle, backgroundColor: "#D70902" }} onClick={() => handleClick("Denied")}>
                <Cancel />
                <Typography noWrap style={{fontSize: '10px'}}>Denied ({status.Denied})</Typography>
        </Card>
        </Item>
        <Item>
        <Card style={{ ...cardStyle, backgroundColor: "#343434" }} onClick={() => handleClick("Archived")}>
                <Lock />
                <Typography noWrap style={{fontSize: '10px'}}>Archived ({status.Archived})</Typography>
        </Card>
        </Item>
        <Item>
        <Card style={{ ...cardStyle, backgroundColor: "#276787" }} onClick={() => handleClick("Conditional")}>
                <Alarm />
                <Typography noWrap style={{fontSize: '10px'}}>Conditional ({status.Conditional})</Typography>                   
        </Card>
        </Item>
        <Item>
        <Card style={{ ...cardStyle, backgroundColor: "#9A9A9A" }} onClick={() => handleClick("Unsubmitted")}>
                <HourglassBottom />
                <Typography noWrap style={{fontSize: '10px'}}>Unsubmitted ({status.Unsubmitted})</Typography>
        </Card>
        </Item>
      </Box>
      
    </Container>
  );
};

export default CustomField;
