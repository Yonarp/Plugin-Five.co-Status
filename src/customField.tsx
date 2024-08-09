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
    width: "150px",
    // width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    //marginRight: "10px 0",
    padding: "10px 20px",
    fontSize: '10px', 
    color: "white",
    // maxHeight: "50px", // Adjust the height as needed
    // textAlign: "center", // Ensure text is centered within the card
    // boxsmallmallizing: "border-box"
  };

  // return (
  //   <Container
  //     style={{
  //       maxWidth: "100vw",
  //       background: "transparent",
  //       border: "none",
  //       outline: "none",
  //       padding: "0",
  //       margin: "0",
  //     }}
  //   >
  //     <Box
  //       style={{
  //         display: "flex",
  //         justifyContent: "space-between",
  //         alignItems: "center",
  //         flexDirection: "row",
  //         maxWidth: "100vw",
  //         background: "transparent",
  //         border: "none",
  //         outline: "none",
  //         padding: "0",
  //         margin: "0",
  //       }}
  //     >
  //       <Card style={{ ...cardStyle, backgroundColor: "#8DAC6E" }}>
  //         <Check style={{ fill: "white", color: "white" }} />
  //         {" "}Approved{" "}(
  //         {status.Approved}
  //         )
  //       </Card>
  //       <Card style={{ ...cardStyle, backgroundColor: "#FCBD09" }}>
  //         <HourglassBottom style={{ fill: "white", color: "white" }}/>
  //         {" "}Pending{" "}(
  //         {status.Pending}
  //         )
  //       </Card>
  //       <Card style={{ ...cardStyle, backgroundColor: "#D70902" }}>
  //         <Cancel />
  //         {" "}Denied{" "}(
  //         {status.Denied}
  //         )
  //       </Card>
  //       <Card style={{ ...cardStyle, backgroundColor: "#343434" }}>
  //         <Lock />
  //         {" "}Archived{" "}(
  //         {status.Archived}
  //         )
  //       </Card>
  //       <Card style={{ ...cardStyle, backgroundColor: "#276787" }}>
  //         <Alarm />
  //         {" "}Conditional{" "}(
  //         {status.Conditional}
  //         )
  //       </Card>
  //       <Card style={{ ...cardStyle, backgroundColor: "#9A9A9A" }}>
  //         <HourglassBottom />
  //         {" "}Unsubmitted{" "}(
  //         {status.Unsubmitted}
  //         )
  //       </Card>
  //     </Box>
  //   </Container>
  // );  
  //return (
  return(
  // <ThemeProvider theme={theme}>
    // <Container
    //   style={{
    //     maxWidth: "100vw",
    //     background: "white",
    //     border: "none",
    //     outline: "none",
    //     padding: "0",
    //     margin: "0"
    //   }}
    // >
      
    //     {/* <Box
    //       style={{
    //         display: "flex",
    //         justifyContent: "space-between",
    //         alignItems: "center",
    //         flexDirection: "row",
    //         maxWidth: "100vw",
    //         background: "transparent",
    //         border: "none",
    //         outline: "none",
    //         padding: "0",
    //         margin: "0",
    //       }}
    //     > */}
    //   <Grid container spacing={1} justifyContent={"center"} columns={{ xsmall: 6, small: 6, medium: 2, large: 30}} >
    //       {status.Approved !== undefined && (
    //         <Grid item xsmall={6} small={4} medium={1} large={5}>
    //             <Card style={{ ...cardStyle, backgroundColor: "#8DAC6E" }}>
    //               <Check style={{ fill: "white", color: "white" }} />
    //               <Typography noWrap style={{fontSize: '10px'}}>Approved ({status.Approved})</Typography>
    //             </Card>
    //         </Grid>
    //       )}
    //       {status.Pending !== undefined && (
    //         <Grid item xsmall={6} small={4} medium={1} large={5}>
    //           <Card style={{ ...cardStyle, backgroundColor: "#FCBD09" }}>
    //             <HourglassBottom style={{ fill: "white", color: "white" }}/>
    //             <Typography noWrap style={{fontSize: '10px'}}>Pending ({status.Pending})</Typography>
    //           </Card>
    //         </Grid>
    //       )}
    //       {status.Denied !== undefined && (
    //         <Grid item xsmall={6} small={4} medium={1} large={5}>
    //           <Card style={{ ...cardStyle, backgroundColor: "#D70902" }}>
    //             <Cancel />
    //             <Typography noWrap style={{fontSize: '10px'}}>Denied ({status.Denied})</Typography>
    //           </Card>
    //         </Grid>
    //       )}
    //       {status.Archived !== undefined && (
    //         <Grid item xsmall={6} small={4} medium={1} large={5}>
    //           <Card style={{ ...cardStyle, backgroundColor: "#343434" }}>
    //             <Lock />
    //             <Typography noWrap style={{fontSize: '10px'}}>Archived ({status.Archived})</Typography>
    //           </Card>
    //         </Grid>
    //       )}
    //       {status.Conditional !== undefined && (
    //         <Grid item xsmall={6} small={4} medium={1} large={5}>
    //           <Card style={{ ...cardStyle, backgroundColor: "#276787" }}>
    //             <Alarm />
    //             <Typography noWrap style={{fontSize: '10px'}}>Conditional ({status.Conditional})</Typography>                
    //           </Card>
    //         </Grid>
    //       )}
    //       {status.Unsubmitted !== undefined && (
    //         <Grid item xsmall={6} small={4} medium={1} large={5}>
    //           <Card style={{ ...cardStyle, backgroundColor: "#9A9A9A" }}>
    //             <HourglassBottom />
    //             <Typography noWrap style={{fontSize: '10px'}}>Unsubmitted ({status.Unsubmitted})</Typography>
    //           </Card>
    //         </Grid>
    //       )}
          
    //     {/* </Box> */}
    //   </Grid>
    // </Container>
  // </ThemeProvider>>
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
          <Card style={{ ...cardStyle, backgroundColor: "#8DAC6E" }}>
            <Check style={{ fill: "white", color: "white" }} />
            <Typography noWrap style={{fontSize: '10px'}}>Approved ({status.Approved})</Typography>
          </Card>
        </Item>
        <Item>
        <Card style={{ ...cardStyle, backgroundColor: "#FCBD09" }}>
                <HourglassBottom style={{ fill: "white", color: "white" }}/>
                <Typography noWrap style={{fontSize: '10px'}}>Pending ({status.Pending})</Typography>
              </Card>
        </Item>
        <Item>
        <Card style={{ ...cardStyle, backgroundColor: "#D70902" }}>
                <Cancel />
                <Typography noWrap style={{fontSize: '10px'}}>Denied ({status.Denied})</Typography>
              </Card>
        </Item>
        <Item>
        <Card style={{ ...cardStyle, backgroundColor: "#343434" }}>
                <Lock />
                <Typography noWrap style={{fontSize: '10px'}}>Archived ({status.Archived})</Typography>
              </Card>
        </Item>
        <Item>
        <Card style={{ ...cardStyle, backgroundColor: "#276787" }}>
                <Alarm />
                <Typography noWrap style={{fontSize: '10px'}}>Conditional ({status.Conditional})</Typography>                   
              </Card>
        </Item>
        <Item>
        <Card style={{ ...cardStyle, backgroundColor: "#9A9A9A" }}>
                <HourglassBottom />
                <Typography noWrap style={{fontSize: '10px'}}>Unsubmitted ({status.Unsubmitted})</Typography>
              </Card>
        </Item>
      </Box>





      
    </Container>
  );
};

export default CustomField;
