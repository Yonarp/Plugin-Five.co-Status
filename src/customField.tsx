import React, { useEffect, useState } from "react";
import { Box, Card, CircularProgress, FiveInitialize } from "./FivePluginApi";
import { CustomFieldProps } from "../../../common";
import { Container, Typography } from "@mui/material";
import { Alarm, Cancel, Check, HourglassBottom, Lock, Undo } from "@mui/icons-material";

FiveInitialize();

interface StatusCounts {
  Approved: number,
  Submitted: number,
  Denied: number,
  Archived: number,
  Conditional: number,
  Unsubmitted: number
}


const CustomField = (props: CustomFieldProps) => {
  const { five } = props;
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ status, setStatus ] = useState<StatusCounts>(null);

  // FIX Type
  const countStatuses = (data: any) => {
    const statusCounts = {
      Approved: 0,
      Submitted: 0,
      Denied: 0,
      Archived: 0,
      Conditional: 0,
      Unsubmitted: 0,
    };

    if(data.length > 0){
      data.forEach((item: any) => {
        const status = item.Status;
        statusCounts[status]++;
      });
    }
    return statusCounts;
  };
  
  const handleClick = (status: string) => {
    if(status === 'All') {
      five.setVariable("Status", `"__USR" eq '${five.currentUserKey()}'`);
    } else {
      five.setVariable("Status", `Status eq '${status}'`);
      five.setVariable("Status", `"__USR" eq '${five.currentUserKey()}' and Status eq '${status}'`);
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
          // barrier can have issues if the values 
          const data = JSON.parse(result.serverResponse.results).response.value;
          setLoading(false);
          const statusCounts = countStatuses(data);
          setStatus(statusCounts);
        }
      );
    };
    fetchData();   

  }, []);

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
     /* media queries */
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
  `;

  return (
    <Container
      style={{
        position: 'absolute',
        top: 5,
        left: "-10%",
        margin: 0,
        padding: 0,
        width:'130%',
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap", // Prevent wrapping
        overflowX: "auto", // Enable horizontal scroll
        background: "white",
        border: "none", 
        outline: "none"
      }}
    >
      <style>{cardCss}</style>

      <Item>
        <Card className="MuiCard-root" style={{ ...cardStyle, backgroundColor: "#8DAC6E" }} onClick={() => handleClick("Approved")}>
          <Check style={{ fill: "white", color: "white" }} />
          <Typography className="statusText" noWrap style={{ fontSize: "10px" }}>
            Approved ({status.Approved})
          </Typography>
        </Card>
      </Item>

      <Item>
        <Card className="MuiCard-root" style={{ ...cardStyle, backgroundColor: "#FCBD09" }} onClick={() => handleClick("Submitted")}>
          <HourglassBottom style={{ fill: "white", color: "white" }} />
          <Typography className="statusText" noWrap style={{ fontSize: "10px" }}>
            Submitted ({status.Submitted})
          </Typography>
        </Card>
      </Item>

      <Item>
        <Card className="MuiCard-root" style={{ ...cardStyle, backgroundColor: "#D70902" }} onClick={() => handleClick("Denied")}>
          <Cancel />
          <Typography className="statusText" noWrap style={{ fontSize: "10px" }}>
            Denied ({status.Denied})
          </Typography>
        </Card>
      </Item>

      <Item>
        <Card className="MuiCard-root" style={{ ...cardStyle, backgroundColor: "#343434" }} onClick={() => handleClick("Archived")}>
          <Lock />
          <Typography className="statusText" noWrap style={{ fontSize: "10px" }}>
            Archived ({status.Archived})
          </Typography>
        </Card>
      </Item>

      <Item>
        <Card  className="MuiCard-root" style={{ ...cardStyle, backgroundColor: "#276787" }} onClick={() => handleClick("Conditional")}>
          <Alarm />
          <Typography className="statusText" noWrap style={{ fontSize: "10px" }}>
            Conditional ({status.Conditional})
          </Typography>
        </Card>
      </Item>

      <Item>
        <Card  className="MuiCard-root" style={{ ...cardStyle, backgroundColor: "#9A9A9A" }} onClick={() => handleClick("Unsubmitted")}>
          <HourglassBottom />
          <Typography noWrap className="statusText" style={{ fontSize: "10px" }}>
            Unsubmitted ({status.Unsubmitted})
          </Typography>
        </Card>
      </Item>
      <Item>
        <Card  className="MuiCard-root" style={{ ...cardStyle, backgroundColor: "#0F0F0F" }} onClick={() => handleClick("All")}>
          <Undo/>
          <Typography noWrap className="statusText" style={{ fontSize: "10px" }}>
            All 
          </Typography>
        </Card>
      </Item>
    </Container>
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
