import React, { useEffect, useState } from 'react';
import { Button, Card, CardActions, CardContent, CardMedia, CircularProgress, Typography } from '@mui/material';
import { db, getUserData, deleteUserData, resetUserData } from './api';

const App: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchData();
    fetchTotalCount();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getUserData();
    setUsers(data);
    setLoading(false);
  };

  const fetchTotalCount = async () => {
    const count = await db.meta.get('count');
    if (count) {
      setTotalCount(count.value);
    }
  };

  const handleDelete = (userId: number) => {
    deleteUserData(userId);
    setUsers((prevUsers) => prevUsers.filter((user: any) => user.id !== userId));
    setTotalCount((prevCount) => prevCount - 1);
  };

  const handleRefresh = async () => {
    setLoading(true);
    const data = await resetUserData();
    setUsers(data);
    setLoading(false);
    setTotalCount(data.length);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleRefresh}>
        Refresh
      </Button>
      <Typography variant="h5" component="h2" gutterBottom>
        Total Number of items: {totalCount}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          {users.map((user: any) => (
            <Card key={user.id} sx={{ maxWidth: 345, marginBottom: 20 }}>
              <CardMedia component="img" height="140" image={user.picture.large} alt={user.name.first} />
              <CardContent>
                <Typography variant="h6" component="div">
                  {user.name.first} {user.name.last}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleDelete(user.id)}>
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
