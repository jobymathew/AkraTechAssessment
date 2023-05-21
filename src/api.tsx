import Dexie from 'dexie';

interface User {
  id: number;
  name: {
    first: string;
    last: string;
  };
  picture: {
    large: string;
  };
}

class MyDatabase extends Dexie {
  users: Dexie.Table<User, number>;
  meta: Dexie.Table<{ id: string; value: any }, string>;

  constructor() {
    super('MyDatabase');
    this.version(1).stores({
      users: 'id',
      meta: 'id',
    });
    this.users = this.table('users');
    this.meta = this.table('meta');
  }
}

export const db = new MyDatabase();

const fetchData = async () => {
    const response = await fetch('https://randomuser.me/api/?results=50');
    const data = await response.json();
  
    const users = data.results.map((user: any, index: number) => ({
      id: index + 1,
      name: {
        first: user.name.first,
        last: user.name.last,
      },
      picture: {
        large: user.picture.large,
      },
    }));

    return users;

}

export const getUserData = async () => {

    const storedUsers = await db.users.toArray();


    // check if already fetched, else get from api
    if (storedUsers.length > 0) {
        return storedUsers;
    }
    else
    {
        const users = await fetchData();

        await db.transaction('rw', db.users, db.meta, async () => {
            await db.users.bulkPut(users);
            await db.meta.put({ id: 'count', value: users.length });
        });
        return users;
    }
  
    
  };

export const resetUserData = async () => {

    const users = await fetchData();
  
        await db.transaction('rw', db.users, db.meta, async () => {
            await db.users.bulkPut(users);
            await db.meta.put({ id: 'count', value: users.length });
      });
  
    return users;
}

export const deleteUserData = async (userId: number) => {
  db.users.delete(userId);
  const currentCount = await db.meta.get('count');
  if(currentCount) {
    db.meta.put({ id: 'count', value: currentCount.value - 1});
  }
};
