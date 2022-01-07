import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ICharger, IReservation } from "../interfaces";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog, DialogActions, DialogContent,
  DialogTitle,
  Divider,
  Grid, IconButton, List, ListItem, ListItemText, TextField,
  Typography
} from "@mui/material";
import { Delete as DeleteIcon } from '@mui/icons-material';
import { handleApiError, privateAxios } from "../util/api";
import { useSnackbar } from "notistack";
import { DateTimePicker } from "@mui/lab";
import { AuthContext } from "../contexts/auth";

interface Props {
  charger: ICharger;
}

const Charger: React.FC<Props> = ({charger}: Props) => {
  const {enqueueSnackbar} = useSnackbar();
  const {authState} = useContext(AuthContext);

  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newResLoading, setNewResLoading] = useState(false);
  const [newReservationDialogOpen, setNewReservationDialogOpen] = useState(false);
  const [valueFrom, setValueFrom] = React.useState(new Date());
  const [valueUntil, setValueUntil] = React.useState(new Date());

  const getReservations = useCallback(() => {
    setLoading(true);
    // load reservations
    privateAxios.get(`char/chargers/${charger.id}/reservations?limit=1000000`).then(response => {
      setReservations(response.data);
      setLoading(false);
    }).catch(reason => {
      setLoading(false);
      handleApiError(reason, enqueueSnackbar)
    })
  }, [charger.id, enqueueSnackbar])

  const deleteReservation = (reservationId: number) => {
    setNewResLoading(true);
    privateAxios.delete(`char/reservations/${reservationId}`).then(() => {
      getReservations();
      setNewResLoading(false);
    }).catch(reason => {
          setNewResLoading(false);
          handleApiError(reason, enqueueSnackbar)
        }
    )
  }

  useEffect(() => {
    getReservations();
  }, [getReservations]);

  const saveNewReservation = () => {
    setNewResLoading(true);
    privateAxios.post(`char/reservations`, {
      charger_id: charger.id,
      time_from: valueFrom.toISOString(),
      time_until: valueUntil.toISOString(),
    }).then(
        () => {
          setNewResLoading(false);
          enqueueSnackbar('Success!', {variant: 'success'})
          getReservations();
          setValueFrom(new Date());
          setValueUntil(new Date());
          setNewReservationDialogOpen(false);
        }
    ).catch(
        () => {
          setNewResLoading(false);
          enqueueSnackbar('Time slot not available.', {variant: 'warning'})
        }
    )
  }

  return (
      <>
        <Card style={{height: '100%'}}>
          <Box p={2}>
            <Grid container direction='row'>
              <Grid item xs={12} spacing={1}>
                <Typography variant='h6'>
                  {charger.name}
                </Typography>
                <Typography variant='caption'>{charger.address}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Box pt={2}>
                  <Divider orientation="horizontal">Reservations</Divider>
                </Box>
              </Grid>
              {
                loading ? <CircularProgress/> : reservations == null ?
                    <Typography variant='caption' textAlign='center' style={{width: '100%'}}>No reservations
                      yet.</Typography> : <Grid item xs={12}><List> {reservations.map(reservation => {
                          return <ListItem key={reservation.id} secondaryAction={
                            authState.user.uid === reservation.user_id ? <IconButton edge="end" aria-label="delete"
                                                                                     onClick={() => deleteReservation(reservation.id)}>
                              <DeleteIcon/>
                            </IconButton> : null
                          }>
                            <ListItemText>{new Date(reservation.time_from).toLocaleString()} - {new Date(reservation.time_until).toLocaleString()}</ListItemText>
                          </ListItem>
                        }
                    )}</List></Grid>
              }
              <Grid item xs={12}>
                <Button onClick={() => setNewReservationDialogOpen(true)}>Add reservation</Button>
              </Grid>
            </Grid>
          </Box>
        </Card>

        <Dialog open={newReservationDialogOpen} fullWidth maxWidth={'sm'}
                onClose={() => setNewReservationDialogOpen(false)}>
          <DialogTitle>
            New reservation
          </DialogTitle>
          <DialogContent>
            <Grid container direction='row' spacing={2} justifyContent='center'>
              {
                newResLoading ? <Grid item><Box pt={3}><CircularProgress/></Box></Grid> : <>
                  <Grid item xs={12} sm={6}>
                    <Box pt={1}>
                      <DateTimePicker
                          label="From"
                          value={valueFrom}
                          onChange={value => setValueFrom(value ?? new Date())}
                          renderInput={(params) => <TextField fullWidth={true} {...params} />}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box pt={1}>
                      <DateTimePicker
                          label="Until"
                          value={valueUntil}
                          onChange={value => setValueUntil(value ?? new Date())}
                          renderInput={(params) => <TextField fullWidth={true} {...params} />}
                      />
                    </Box>
                  </Grid>
                </>
              }
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewReservationDialogOpen(false)} disabled={newResLoading}>
              Cancel
            </Button>
            <Button onClick={saveNewReservation}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </>
  );
}

export default Charger;