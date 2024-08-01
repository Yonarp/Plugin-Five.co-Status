//@ts-nocheck
import React, { useEffect, useState } from "react";
import { Box, Card, CircularProgress, FiveInitialize } from "./FivePluginApi";
import { CustomFieldProps } from "../../../common";
import { Container } from "@mui/material";
import { Alarm, Cancel, Check, HourglassBottom, Lock } from "@mui/icons-material";

FiveInitialize();

const CustomField = (props: CustomFieldProps) => {
  const { theme, value, onValueUpdated, variant, five } = props;
  const [ivr, setIVR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({});

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
    width: "20vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "10px",
    padding: "10px 20px",
    fontSize: '10px',
    color: "white",
    maxHeight: "50px", // Adjust the height as needed
  };

  return (
    <Container
      style={{
        maxWidth: "100vw",
        background: "transparent",
        border: "none",
        outline: "none",
        padding: "0",
        margin: "0",
      }}
    >
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          maxWidth: "100vw",
          background: "transparent",
          border: "none",
          outline: "none",
          padding: "0",
          margin: "0",
        }}
      >
        <Card style={{ ...cardStyle, backgroundColor: "#8DAC6E" }}>
          <Check style={{ fill: "white", color: "white" }} />
          {" "}Approved{" "}(
          {status.Approved}
          )
        </Card>
        <Card style={{ ...cardStyle, backgroundColor: "#FCBD09" }}>
          <HourglassBottom style={{ fill: "white", color: "white" }}/>
          {" "}Pending{" "}(
          {status.Pending}
          )
        </Card>
        <Card style={{ ...cardStyle, backgroundColor: "#D70902" }}>
          <Cancel />
          {" "}Denied{" "}(
          {status.Denied}
          )
        </Card>
        <Card style={{ ...cardStyle, backgroundColor: "#343434" }}>
          <Lock />
          {" "}Archived{" "}(
          {status.Archived}
          )
        </Card>
        <Card style={{ ...cardStyle, backgroundColor: "#276787" }}>
          <Alarm />
          {" "}Conditional{" "}(
          {status.Conditional}
          )
        </Card>
        <Card style={{ ...cardStyle, backgroundColor: "#9A9A9A" }}>
          <HourglassBottom />
          {" "}Unsubmitted{" "}(
          {status.Unsubmitted}
          )
        </Card>
      </Box>
    </Container>
  );
};

export default CustomField;
